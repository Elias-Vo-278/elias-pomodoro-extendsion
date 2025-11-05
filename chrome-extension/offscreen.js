const player = document.getElementById('music-player');

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target !== 'offscreen') {
        return; 
    }
    if (!player) {
        console.error("music-player element not found!");
        return;
    }
    if (message.action === 'play') {
        if (player) { 
            player.src = message.url;
        }
            console.log('message', message.url);

        try {
            if (player) {
                await player.play();
            }
            console.log('Audio playback started for:', message.url);
        } catch (error) {
            console.error('Playback failed:', JSON.stringify(error));
        }
    } else if (message.action === 'stop') {
        if (player) {
            player.pause();
            player.currentTime = 0;
            player.src = '';
            console.log('Audio playback stopped.');
        }
    }
});
player.addEventListener('ended', async () => {
    console.log('Song ended. Requesting next song...');
    
    chrome.runtime.sendMessage({ 
        action: 'song-ended'
    });
});