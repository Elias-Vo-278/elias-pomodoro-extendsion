const OFFSCREEN_PATH = 'offscreen.html';
const BACKEND_API = 'http://localhost:3000/api/music';

let scheduleTimer = null;
let scheduledMinute = null;

async function setupOffscreenDocument(path) {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  if (contexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play background music at intervals.'
  });
}

async function fetchAndPlayRandomMusic() {
  await setupOffscreenDocument(OFFSCREEN_PATH);

  try {
    const response = await fetch(`${BACKEND_API}`);
    const song = await response.json();

    chrome.runtime.sendMessage({
      action: 'play',
      target: 'offscreen',
      url: song.url
    });

    await chrome.storage.local.set({
      isPlaying: true,
      currentSong: song
    });

    console.log(`Now playing: ${song.title}`);
  } catch (error) {
    console.error('Error fetching music:', error);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'start-schedule') {
    scheduledMinute = message.minute;

    if (scheduleTimer) clearTimeout(scheduleTimer);

    function scheduleNextPlayback() {
      const now = new Date();
      let next = new Date(now.getTime());
      next.setSeconds(0);
      next.setMilliseconds(0);
      if (now.getMinutes() < scheduledMinute) {
        next.setMinutes(scheduledMinute);
      } else {
        next.setHours(next.getHours() + 1);
        next.setMinutes(scheduledMinute);
      }
      const delay = next.getTime() - now.getTime();

      scheduleTimer = setTimeout(async () => {
        await fetchAndPlayRandomMusic();
        scheduleNextPlayback();
      }, delay);
    }

    scheduleNextPlayback();

    chrome.storage.local.set({ isPlaying: true, scheduledMinute });
    console.log(`Scheduled playback at minute ${scheduledMinute} of each hour.`);
  }

  if (message.action === 'stop-schedule') {
    if (scheduleTimer) {
      clearTimeout(scheduleTimer);
      scheduleTimer = null;
    }

    chrome.runtime.sendMessage({ action: 'stop', target: 'offscreen' });
    chrome.storage.local.set({ isPlaying: false });
    console.log('Music stopped by user.');
  }

  if (message.action === 'song-ended') {
    console.log('Song ended, waiting for next interval...');
  }
});