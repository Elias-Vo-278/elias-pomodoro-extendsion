const OFFSCREEN_PATH = 'offscreen.html';
const BACKEND_API = 'http://localhost:3000/api/music';

let alarmCheckInterval = null;
let activeAlarms = [];
let currentPlayingAlarmId = null;
let lastCheckedMinute = -1;

// Notify content scripts to show overlay animation
async function notifyPomodoroDone(alarmId) {
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs.map((tab) => {
        if (!tab.id) return Promise.resolve();
        return chrome.tabs.sendMessage(tab.id, {
          action: 'pomodoro:done',
          alarmId,
          text: 'Đến giờ rồi! Thư giãn chút nhé 🐇'
        }).catch(() => {});
      })
    );
  } catch (error) {
    console.error('❌ Error notifying tabs:', error);
  }
}

// Setup offscreen document for audio playback
async function setupOffscreenDocument(path) {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  if (contexts.length > 0) {
    console.log('✅ Offscreen document already exists');
    return;
  }

  try {
    await chrome.offscreen.createDocument({
      url: path,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play background music for alarms.'
    });
    console.log('✅ Offscreen document created');
  } catch (error) {
    console.error('❌ Error creating offscreen document:', error);
  }
}

// Fetch and play random music
async function fetchAndPlayRandomMusic(alarmId = null) {
  console.log(`🎵 Attempting to play music for alarm ${alarmId}`);
  
  await setupOffscreenDocument(OFFSCREEN_PATH);

  try {
    console.log(`📡 Fetching music from ${BACKEND_API}`);
    const response = await fetch(`${BACKEND_API}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('⚠️ No music found (API trả về 404). Có thể database trống, cần migrate dữ liệu.');
      } else {
        console.error(`❌ Music API error: HTTP ${response.status}`);
      }
      return;
    }

    const song = await response.json();
    console.log(`🎶 Received song: ${song.title} - ${song.url}`);

    // Wait longer to ensure offscreen is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify offscreen document exists before sending message
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (contexts.length === 0) {
      console.error('❌ Offscreen document not found, recreating...');
      await setupOffscreenDocument(OFFSCREEN_PATH);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      await chrome.runtime.sendMessage({
        action: 'play',
        target: 'offscreen',
        url: song.url
      });
      console.log('✅ Play message sent successfully');
    } catch (err) {
      console.error('❌ Error sending play message:', err);
      // Try to recreate offscreen and retry once
      console.log('🔄 Attempting to recreate offscreen document...');
      try {
        await chrome.offscreen.closeDocument();
      } catch (e) {
        // Ignore if document doesn't exist
      }
      await setupOffscreenDocument(OFFSCREEN_PATH);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        await chrome.runtime.sendMessage({
          action: 'play',
          target: 'offscreen',
          url: song.url
        });
        console.log('✅ Play message sent successfully after retry');
      } catch (retryErr) {
        console.error('❌ Failed to send play message after retry:', retryErr);
      }
    }

    currentPlayingAlarmId = alarmId;
    
    await chrome.storage.local.set({
      isPlaying: true,
      currentSong: song,
      currentPlayingAlarm: alarmId,
      lastPlayed: new Date().toISOString()
    });

    console.log(`✅ Now playing: ${song.title} (Alarm ID: ${alarmId})`);
  } catch (error) {
    console.error('❌ Error fetching music:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

// Generate alarm times for a pattern
function generateAlarmTimesForPattern(alarm) {
  const times = [];
  
  if (alarm.pattern === 'onetime') {
    if (alarm.hour !== undefined && alarm.minute !== undefined) {
      times.push({ hour: alarm.hour, minute: alarm.minute });
    }
  } else if (alarm.pattern === 'pomodoro') {
    const workMinutes = alarm.workMinutes || 25;
    const breakMinutes = alarm.breakMinutes || 5;
    const startHour = alarm.startHour || 9;
    const startMinute = alarm.startMinute || 0;
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    // Generate for next 8 hours
    for (let i = 0; i < 16; i++) {
      times.push({ hour: currentHour, minute: currentMinute });
      
      if (i % 2 === 0) {
        // Work period
        currentMinute += workMinutes;
      } else {
        // Break period
        currentMinute += breakMinutes;
      }
      
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
      
      if (currentHour >= 24) break;
    }
  } else if (alarm.pattern === 'interval') {
    const intervalMinutes = alarm.intervalMinutes || 30;
    const startHour = alarm.startHour || 9;
    const startMinute = alarm.startMinute || 0;
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    // Generate for next 8 hours
    for (let i = 0; i < 16; i++) {
      times.push({ hour: currentHour, minute: currentMinute });
      
      currentMinute += intervalMinutes;
      while (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
      
      if (currentHour >= 24) break;
    }
  } else if (alarm.pattern === 'daily') {
    times.push(...(alarm.times || []));
  }
  
  return times;
}

// Get all alarm times from all active alarms
function getAllAlarmTimes() {
  const allTimes = [];
  
  activeAlarms.forEach(alarm => {
    const times = generateAlarmTimesForPattern(alarm);
    times.forEach(time => {
      allTimes.push({
        hour: time.hour,
        minute: time.minute,
        alarmId: alarm.id,
        alarm: alarm
      });
    });
  });
  
  return allTimes;
}

// Check if current time matches any active alarm
function checkAlarms() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  // Check every second, but only trigger once per minute
  // This ensures we don't miss alarms if service worker was inactive
  if (currentSecond === 0 && lastCheckedMinute === currentMinute) {
    // Already checked this minute
    return;
  }

  if (currentSecond === 0) {
    lastCheckedMinute = currentMinute;
    
    // Get all alarm times
    const allTimes = getAllAlarmTimes();
    
    if (allTimes.length > 0) {
      console.log(`🔍 Checking alarms at ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
      console.log(`📋 Total alarm times: ${allTimes.length}`);
      
      // Log next few alarm times for debugging
      const nextTimes = allTimes
        .filter(t => t.hour > currentHour || (t.hour === currentHour && t.minute >= currentMinute))
        .slice(0, 3);
      if (nextTimes.length > 0) {
        console.log(`⏭️ Next alarms:`, nextTimes.map(t => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`).join(', '));
      }
    }
    
    // Check if any alarm matches current time
    const matchingAlarm = allTimes.find(
      time => time.hour === currentHour && time.minute === currentMinute
    );

    if (matchingAlarm) {
      console.log(`⏰ Alarm triggered at ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} (Alarm ID: ${matchingAlarm.alarmId})`);
      fetchAndPlayRandomMusic(matchingAlarm.alarmId);
      notifyPomodoroDone(matchingAlarm.alarmId);
    }
  }
}

// Start alarm checking
function startAlarmChecker() {
  if (alarmCheckInterval) {
    clearInterval(alarmCheckInterval);
  }

  // Check every second to catch alarms precisely
  alarmCheckInterval = setInterval(checkAlarms, 1000);
  console.log('✅ Alarm checker started');
  
  // Check immediately
  checkAlarms();
}

// Stop alarm checking
function stopAlarmChecker() {
  if (alarmCheckInterval) {
    clearInterval(alarmCheckInterval);
    alarmCheckInterval = null;
  }
  console.log('⏹️ Alarm checker stopped');
}

// Load alarms from storage
async function loadAlarms() {
  try {
    const result = await chrome.storage.local.get(['alarms']);
    const alarms = result.alarms || [];
    activeAlarms = alarms.filter(a => a.active !== false);
    
    console.log(`📋 Loading alarms: ${alarms.length} total, ${activeAlarms.length} active`);
    
    if (activeAlarms.length > 0) {
      // Log alarm details
      activeAlarms.forEach(alarm => {
        const times = generateAlarmTimesForPattern(alarm);
        console.log(`  - Alarm ${alarm.id} (${alarm.pattern || 'onetime'}): ${times.length} time(s)`);
      });
      
      startAlarmChecker();
    } else {
      stopAlarmChecker();
    }
  } catch (error) {
    console.error('❌ Error loading alarms:', error);
  }
}

// Initialize on startup
loadAlarms();

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Received message:', message.action);
  
  if (message.action === 'update-alarms') {
    activeAlarms = message.alarms || [];
    
    console.log(`📋 Updated alarms: ${activeAlarms.length} active`);
    
    if (activeAlarms.length > 0) {
      activeAlarms.forEach(alarm => {
        const times = generateAlarmTimesForPattern(alarm);
        console.log(`  - Alarm ${alarm.id} (${alarm.pattern || 'onetime'}): ${times.length} time(s)`);
      });
      
      startAlarmChecker();
    } else {
      stopAlarmChecker();
    }
    
    sendResponse({ success: true });
  }

  if (message.action === 'stop-alarm') {
    const alarmId = message.alarmId;
    
    // Stop audio if this alarm is playing
    if (currentPlayingAlarmId === alarmId) {
      chrome.runtime.sendMessage({ 
        action: 'stop', 
        target: 'offscreen' 
      });
      
      currentPlayingAlarmId = null;
      
      chrome.storage.local.set({ 
        isPlaying: false,
        currentPlayingAlarm: null
      });
      
      console.log(`⏹️ Stopped alarm ${alarmId}`);
    }
    
    sendResponse({ success: true });
  }

  if (message.action === 'stop-all') {
    stopAlarmChecker();
    activeAlarms = [];
    currentPlayingAlarmId = null;
    
    chrome.runtime.sendMessage({ 
      action: 'stop', 
      target: 'offscreen' 
    });
    
    chrome.storage.local.set({ 
      isPlaying: false,
      currentPlayingAlarm: null,
      alarms: []
    });
    
    console.log('⏹️ All alarms stopped');
    sendResponse({ success: true });
  }

  // Test function - trigger alarm immediately
  if (message.action === 'test-alarm') {
    console.log('🧪 Testing alarm trigger');
    fetchAndPlayRandomMusic('test');
    notifyPomodoroDone('test');
    sendResponse({ success: true });
  }

  // Legacy support for old hourly schedule
  if (message.action === 'start-schedule') {
    const minute = message.minute;
    const now = new Date();
    const currentHour = now.getHours();
    
    // Add alarm for current hour and next hours
    activeAlarms = [
      { hour: currentHour, minute, active: true, id: 'legacy-1', pattern: 'onetime' },
      { hour: (currentHour + 1) % 24, minute, active: true, id: 'legacy-2', pattern: 'onetime' }
    ];
    
    startAlarmChecker();
    chrome.storage.local.set({ 
      isPlaying: true, 
      scheduledMinute: minute,
      alarms: activeAlarms
    });
    
    console.log(`⏰ Legacy schedule: minute ${minute} of each hour`);
    sendResponse({ success: true });
  }

  if (message.action === 'stop-schedule') {
    stopAlarmChecker();
    activeAlarms = [];
    currentPlayingAlarmId = null;
    
    chrome.runtime.sendMessage({ 
      action: 'stop', 
      target: 'offscreen' 
    });
    
    chrome.storage.local.set({ 
      isPlaying: false,
      currentPlayingAlarm: null,
      alarms: []
    });
    
    console.log('⏹️ Legacy schedule stopped');
    sendResponse({ success: true });
  }

  if (message.action === 'song-ended') {
    console.log('🎵 Song ended');
    
    // Clear playing state
    currentPlayingAlarmId = null;
    chrome.storage.local.set({ 
      isPlaying: false,
      currentPlayingAlarm: null
    });
    
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.alarms) {
    console.log('📦 Alarms changed in storage, reloading...');
    loadAlarms();
  }
});

// Check alarms immediately on startup and then periodically
checkAlarms();