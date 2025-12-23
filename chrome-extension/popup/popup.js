// DOM Elements
const hourInput = document.getElementById('hour-input');
const minuteInput = document.getElementById('minute-input');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmsList = document.getElementById('alarms-list');
const statusText = document.getElementById('status-text');
const stopAllBtn = document.getElementById('stop-all-btn');

// Pattern elements
const patternButtons = document.querySelectorAll('.pattern-btn');
const patternSettings = document.querySelectorAll('.pattern-settings');
let currentPattern = 'onetime';

// Daily times list
let dailyTimes = [];

// Initialize
loadAlarms();
setupPatternSelector();

// Pattern selector setup
function setupPatternSelector() {
  patternButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pattern = btn.getAttribute('data-pattern');
      selectPattern(pattern);
    });
  });
  
  // Select first pattern by default
  selectPattern('onetime');
}

function selectPattern(pattern) {
  currentPattern = pattern;
  
  // Update buttons
  patternButtons.forEach(btn => {
    if (btn.getAttribute('data-pattern') === pattern) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update settings visibility
  patternSettings.forEach(settings => {
    settings.classList.remove('active');
  });
  
  const activeSettings = document.getElementById(`${pattern}-settings`);
  if (activeSettings) {
    activeSettings.classList.add('active');
  }
  
  // Special handling for daily pattern
  if (pattern === 'daily') {
    updateDailyTimesList();
  }
}

// Daily pattern helpers
function addDailyTime() {
  const hour = parseInt(document.getElementById('daily-hour').value) || 9;
  const minute = parseInt(document.getElementById('daily-minute').value) || 0;
  
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  
  if (!dailyTimes.some(t => t.hour === hour && t.minute === minute)) {
    dailyTimes.push({ hour, minute });
    updateDailyTimesList();
  }
}

function removeDailyTime(index) {
  dailyTimes.splice(index, 1);
  updateDailyTimesList();
}

function updateDailyTimesList() {
  const listEl = document.getElementById('daily-times-list');
  
  if (dailyTimes.length === 0) {
    listEl.innerHTML = '<div style="color: #95a5a6; font-size: 12px; text-align: center;">Chưa có thời điểm nào</div>';
    return;
  }
  
  listEl.innerHTML = dailyTimes.map((time, index) => {
    const timeStr = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; margin-bottom: 4px; background: #f8f9fa; border-radius: 4px;">
        <span style="font-weight: 600;">${timeStr}</span>
        <button class="btn btn-small btn-danger" data-daily-index="${index}" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
      </div>
    `;
  }).join('');
  
  // Attach remove listeners
  listEl.querySelectorAll('[data-daily-index]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('[data-daily-index]').getAttribute('data-daily-index'));
      removeDailyTime(index);
    });
  });
}

// Add button for daily pattern
const addDailyTimeBtn = document.getElementById('add-daily-time-btn');
if (addDailyTimeBtn) {
  addDailyTimeBtn.addEventListener('click', addDailyTime);
}

document.getElementById('daily-hour').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addDailyTime();
  }
});

document.getElementById('daily-minute').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addDailyTime();
  }
});

// Format time for display
function formatTimeDisplay(hour, minute) {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${h}:${m}`;
}

// Get pattern name
function getPatternName(pattern) {
  const names = {
    'onetime': 'Một Lần',
    'pomodoro': 'Pomodoro',
    'interval': 'Lặp Lại',
    'daily': 'Hàng Ngày'
  };
  return names[pattern] || pattern;
}

// Render alarms list
async function renderAlarms() {
  const result = await chrome.storage.local.get(['alarms', 'currentPlayingAlarm']);
  const alarms = result.alarms || [];
  const currentPlaying = result.currentPlayingAlarm || null;
  
  if (alarms.length === 0) {
    alarmsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏰</div>
        <div class="empty-state-text">Chưa có báo thức nào</div>
      </div>
    `;
    return;
  }

  // Sort alarms by time
  alarms.sort((a, b) => {
    if (a.hour !== undefined && b.hour !== undefined) {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return (a.minute || 0) - (b.minute || 0);
    }
    return 0;
  });

  alarmsList.innerHTML = alarms.map((alarm, index) => {
    const isActive = alarm.active !== false;
    const isPlaying = currentPlaying === alarm.id;
    const patternName = getPatternName(alarm.pattern || 'onetime');
    
    let timeDisplay = '';
    if (alarm.pattern === 'pomodoro') {
      timeDisplay = `Bắt đầu: ${formatTimeDisplay(alarm.startHour || 9, alarm.startMinute || 0)} | Làm: ${alarm.workMinutes || 25}ph | Nghỉ: ${alarm.breakMinutes || 5}ph`;
    } else if (alarm.pattern === 'interval') {
      timeDisplay = `Bắt đầu: ${formatTimeDisplay(alarm.startHour || 9, alarm.startMinute || 0)} | Lặp: ${alarm.intervalMinutes || 30} phút`;
    } else if (alarm.pattern === 'daily') {
      const times = alarm.times || [];
      timeDisplay = times.map(t => formatTimeDisplay(t.hour, t.minute)).join(', ') || 'Chưa có thời điểm';
    } else {
      timeDisplay = formatTimeDisplay(alarm.hour || 0, alarm.minute || 0);
    }
    
    return `
      <div class="alarm-item ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}" data-alarm-id="${alarm.id}">
        <div class="alarm-header">
          <div>
            <div class="alarm-time">
              ${timeDisplay}
              <span class="pattern-badge">${patternName}</span>
            </div>
            <div class="alarm-info">
              ${isActive ? '✅ Đang hoạt động' : '⏸️ Đã tắt'} ${isPlaying ? ' | 🔊 Đang phát' : ''}
            </div>
          </div>
        </div>
        <div class="alarm-actions">
          ${isPlaying ? `
            <button class="btn btn-small btn-warning stop-alarm-btn" data-alarm-id="${alarm.id}">
              ⏹️ Dừng
            </button>
          ` : ''}
          <button class="btn btn-small toggle-alarm-btn ${isActive ? 'btn-secondary' : 'btn-primary'}" 
                  data-alarm-index="${index}">
            ${isActive ? '⏸️ Tắt' : '▶️ Bật'}
          </button>
          <button class="btn btn-small btn-danger delete-alarm-btn" data-alarm-index="${index}">
            🗑️ Xóa
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners after rendering
  attachAlarmEventListeners();
}

// Attach event listeners to alarm buttons
function attachAlarmEventListeners() {
  // Toggle alarm buttons
  const toggleButtons = alarmsList.querySelectorAll('.toggle-alarm-btn');
  toggleButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const index = parseInt(e.target.closest('.toggle-alarm-btn').getAttribute('data-alarm-index'));
      await toggleAlarm(index);
    });
  });

  // Delete alarm buttons
  const deleteButtons = alarmsList.querySelectorAll('.delete-alarm-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const index = parseInt(e.target.closest('.delete-alarm-btn').getAttribute('data-alarm-index'));
      await deleteAlarm(index);
    });
  });

  // Stop alarm buttons
  const stopButtons = alarmsList.querySelectorAll('.stop-alarm-btn');
  stopButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const alarmId = e.target.closest('.stop-alarm-btn').getAttribute('data-alarm-id');
      await stopAlarm(alarmId);
    });
  });
}

// Load alarms from storage
async function loadAlarms() {
  await renderAlarms();
  updateStatus();
  
  // Check for playing alarm periodically
  setInterval(async () => {
    await renderAlarms();
  }, 1000);
}

// Update status text
async function updateStatus() {
  const result = await chrome.storage.local.get(['alarms', 'isPlaying', 'currentPlayingAlarm']);
  const alarms = result.alarms || [];
  const activeAlarms = alarms.filter(a => a.active !== false);
  const isPlaying = result.isPlaying || false;
  
  if (activeAlarms.length === 0) {
    statusText.textContent = 'Không có báo thức nào đang hoạt động';
    statusText.className = 'status-text';
  } else if (isPlaying) {
    statusText.textContent = `🔊 Đang phát nhạc | ${activeAlarms.length} báo thức hoạt động`;
    statusText.className = 'status-text active';
  } else {
    statusText.textContent = `${activeAlarms.length} báo thức đang hoạt động`;
    statusText.className = 'status-text active';
  }
}

// Generate alarm times based on pattern
function generateAlarmTimes(pattern, settings) {
  const times = [];
  const now = new Date();
  
  if (pattern === 'onetime') {
    times.push({
      hour: parseInt(settings.hour) || 8,
      minute: parseInt(settings.minute) || 0
    });
  } else if (pattern === 'pomodoro') {
    const workMinutes = parseInt(settings.workMinutes) || 25;
    const breakMinutes = parseInt(settings.breakMinutes) || 5;
    const startHour = parseInt(settings.startHour) || 9;
    const startMinute = parseInt(settings.startMinute) || 0;
    
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
  } else if (pattern === 'interval') {
    const intervalMinutes = parseInt(settings.intervalMinutes) || 30;
    const startHour = parseInt(settings.startHour) || 9;
    const startMinute = parseInt(settings.startMinute) || 0;
    
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
  } else if (pattern === 'daily') {
    times.push(...(settings.times || []));
  }
  
  return times;
}

// Add new alarm
addAlarmBtn.addEventListener('click', async () => {
  let alarmData = {
    pattern: currentPattern,
    active: true,
    id: Date.now()
  };
  
  let alarmTimes = [];
  
  if (currentPattern === 'onetime') {
    const hour = parseInt(document.getElementById('onetime-hour').value) || 8;
    const minute = parseInt(document.getElementById('onetime-minute').value) || 0;
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      alert('Thời gian không hợp lệ!');
      return;
    }
    
    alarmData.hour = hour;
    alarmData.minute = minute;
    alarmTimes = [{ hour, minute }];
  } else if (currentPattern === 'pomodoro') {
    const workMinutes = parseInt(document.getElementById('pomodoro-work').value) || 25;
    const breakMinutes = parseInt(document.getElementById('pomodoro-break').value) || 5;
    const startHour = parseInt(document.getElementById('pomodoro-start-hour').value) || 9;
    const startMinute = parseInt(document.getElementById('pomodoro-start-minute').value) || 0;
    
    alarmData.workMinutes = workMinutes;
    alarmData.breakMinutes = breakMinutes;
    alarmData.startHour = startHour;
    alarmData.startMinute = startMinute;
    
    alarmTimes = generateAlarmTimes('pomodoro', {
      workMinutes,
      breakMinutes,
      startHour,
      startMinute
    });
  } else if (currentPattern === 'interval') {
    const intervalMinutes = parseInt(document.getElementById('interval-minutes').value) || 30;
    const startHour = parseInt(document.getElementById('interval-start-hour').value) || 9;
    const startMinute = parseInt(document.getElementById('interval-start-minute').value) || 0;
    
    if (intervalMinutes < 1 || intervalMinutes > 1440) {
      alert('Khoảng thời gian phải từ 1 đến 1440 phút!');
      return;
    }
    
    alarmData.intervalMinutes = intervalMinutes;
    alarmData.startHour = startHour;
    alarmData.startMinute = startMinute;
    
    alarmTimes = generateAlarmTimes('interval', {
      intervalMinutes,
      startHour,
      startMinute
    });
  } else if (currentPattern === 'daily') {
    if (dailyTimes.length === 0) {
      alert('Vui lòng thêm ít nhất một thời điểm!');
      return;
    }
    
    alarmData.times = dailyTimes;
    alarmTimes = dailyTimes;
  }
  
  if (alarmTimes.length === 0) {
    alert('Không thể tạo báo thức!');
    return;
  }
  
  const result = await chrome.storage.local.get(['alarms']);
  const alarms = result.alarms || [];
  
  // Check if similar alarm exists
  const exists = alarms.some(a => {
    if (a.pattern !== currentPattern) return false;
    if (currentPattern === 'onetime') {
      return a.hour === alarmData.hour && a.minute === alarmData.minute;
    }
    return JSON.stringify(a) === JSON.stringify(alarmData);
  });
  
  if (exists) {
    alert('Báo thức tương tự đã tồn tại!');
    return;
  }
  
  alarms.push(alarmData);
  await chrome.storage.local.set({ alarms });
  
  // Send message to service worker to update alarms
  await chrome.runtime.sendMessage({
    action: 'update-alarms',
    alarms: alarms.filter(a => a.active !== false)
  });
  
  await renderAlarms();
  updateStatus();
  
  // Reset daily times
  if (currentPattern === 'daily') {
    dailyTimes = [];
    updateDailyTimesList();
  }
});

// Toggle alarm on/off
async function toggleAlarm(index) {
  const result = await chrome.storage.local.get(['alarms']);
  const alarms = result.alarms || [];
  
  if (alarms[index]) {
    alarms[index].active = !alarms[index].active;
    await chrome.storage.local.set({ alarms });
    
    // Send message to service worker
    await chrome.runtime.sendMessage({
      action: 'update-alarms',
      alarms: alarms.filter(a => a.active !== false)
    });
    
    await renderAlarms();
    updateStatus();
  }
}

// Stop specific alarm
async function stopAlarm(alarmId) {
  await chrome.runtime.sendMessage({
    action: 'stop-alarm',
    alarmId: alarmId
  });
  
  await chrome.storage.local.set({
    isPlaying: false,
    currentPlayingAlarm: null
  });
  
  await renderAlarms();
  updateStatus();
}

// Delete alarm
async function deleteAlarm(index) {
  if (!confirm('Bạn có chắc muốn xóa báo thức này?')) {
    return;
  }

  const result = await chrome.storage.local.get(['alarms']);
  const alarms = result.alarms || [];
  
  const alarm = alarms[index];
  alarms.splice(index, 1);
  await chrome.storage.local.set({ alarms });
  
  // If this alarm was playing, stop it
  const playingResult = await chrome.storage.local.get(['currentPlayingAlarm']);
  if (playingResult.currentPlayingAlarm === alarm.id) {
    await stopAlarm(alarm.id);
  }
  
  // Send message to service worker
  await chrome.runtime.sendMessage({
    action: 'update-alarms',
    alarms: alarms.filter(a => a.active !== false)
  });
  
  await renderAlarms();
  updateStatus();
}

// Test alarm button
const testAlarmBtn = document.getElementById('test-alarm-btn');
testAlarmBtn.addEventListener('click', async () => {
  try {
    // Disable button temporarily
    testAlarmBtn.disabled = true;
    testAlarmBtn.textContent = '⏳ Đang kiểm tra...';
    
    // Send test message
    await chrome.runtime.sendMessage({ action: 'test-alarm' });
    
    // Update status
    statusText.textContent = '🔊 Đang phát nhạc kiểm tra...';
    statusText.className = 'status-text active';
    
    // Re-enable button after a moment
    setTimeout(() => {
      testAlarmBtn.disabled = false;
      testAlarmBtn.innerHTML = '<span>🔊</span><span>Kiểm Tra Phát Nhạc</span>';
      
      // Update status after a short delay
      setTimeout(() => {
        updateStatus();
        renderAlarms();
      }, 1000);
    }, 2000);
  } catch (error) {
    console.error('❌ Error testing alarm:', error);
    statusText.textContent = '❌ Lỗi khi kiểm tra phát nhạc';
    statusText.className = 'status-text';
    
    testAlarmBtn.disabled = false;
    testAlarmBtn.innerHTML = '<span>🔊</span><span>Kiểm Tra Phát Nhạc</span>';
    
    alert('Lỗi khi kiểm tra phát nhạc. Vui lòng kiểm tra:\n1. API server có đang chạy ở http://localhost:3000\n2. Console của extension để xem lỗi chi tiết');
  }
});

// Stop all alarms
stopAllBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'stop-all' });
  statusText.textContent = 'Đã dừng tất cả báo thức';
  statusText.className = 'status-text';
  
  // Update all alarms to inactive
  const result = await chrome.storage.local.get(['alarms']);
  const alarms = result.alarms || [];
  alarms.forEach(a => a.active = false);
  await chrome.storage.local.set({ alarms });
  
  await chrome.storage.local.set({
    isPlaying: false,
    currentPlayingAlarm: null
  });
  
  await renderAlarms();
  updateStatus();
});

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.alarms) {
      renderAlarms();
    }
    if (changes.isPlaying || changes.currentPlayingAlarm) {
      renderAlarms();
      updateStatus();
    }
  }
});