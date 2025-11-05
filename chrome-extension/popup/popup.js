const statusEl = document.getElementById('status');
const minuteInput = document.getElementById('minute');

document.getElementById('start-btn').addEventListener('click', async () => {
  const minute = parseInt(minuteInput.value) || 0;
  await chrome.runtime.sendMessage({ action: 'start-schedule', minute });
  statusEl.textContent = `Music scheduled at minute ${minute} of each hour.`;
});

document.getElementById('stop-btn').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ action: 'stop-schedule' });
  statusEl.textContent = 'Music stopped.';
});