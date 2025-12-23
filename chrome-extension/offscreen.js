const player = document.getElementById('music-player');

if (!player) {
    console.error("❌ music-player element not found!");
} else {
    console.log('✅ Music player element found');
}

// Handle player errors
if (player) {
    player.addEventListener('error', (e) => {
        console.error('❌ Audio player error:', e);
        console.error('Error details:', player.error);
    });

    player.addEventListener('loadstart', () => {
        console.log('📡 Audio loading started');
    });

    player.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
    });

    player.addEventListener('play', () => {
        console.log('▶️ Audio playback started');
    });

    player.addEventListener('pause', () => {
        console.log('⏸️ Audio playback paused');
    });

    player.addEventListener('ended', async () => {
        console.log('🎵 Song ended. Notifying service worker...');
        
        try {
            await chrome.runtime.sendMessage({ 
                action: 'song-ended'
            });
            console.log('✅ Song ended message sent');
        } catch (error) {
            console.error('❌ Error sending song-ended message:', error);
        }
    });
}

chrome.runtime.onMessage.addListener(async (message) => {
    console.log('📨 Offscreen received message:', message.action);
    
    if (message.target !== 'offscreen') {
        return; 
    }
    
    if (!player) {
        console.error("❌ music-player element not found!");
        return;
    }
    
    if (message.action === 'play') {
        console.log('🎵 Play request received, URL:', message.url);
        
        try {
            // Dừng bài hiện tại nếu đang phát
            if (!player.paused) {
                player.pause();
                player.currentTime = 0;
            }

            // Gán source mới và thử play luôn, không tự timeout nữa
            player.src = message.url;
            player.load();
            console.log('📝 Player source set to:', message.url, 'readyState:', player.readyState);

            await player.play();
            console.log('✅ Audio playback started successfully');
        } catch (error) {
            console.error('❌ Playback failed:', error);
            console.error('Error details:', error.message, error.stack);

            if (player.error) {
                console.error('Player error code:', player.error.code);
                console.error('Player error message:', player.error.message);
            }
        }
    } else if (message.action === 'stop') {
        console.log('⏹️ Stop request received');
        
        try {
            if (player) {
                player.pause();
                player.currentTime = 0;
                player.src = '';
                console.log('✅ Audio playback stopped');
            }
        } catch (error) {
            console.error('❌ Error stopping playback:', error);
        }
    }
});