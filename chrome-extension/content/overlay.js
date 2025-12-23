(() => {
  const OVERLAY_ID = 'pomodoro-rabbit-overlay';
  const STYLE_ID = 'pomodoro-rabbit-style';
  const DISPLAY_DURATION = 6500; // ms

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        pointer-events: none;
        display: none;
        align-items: flex-end;
        justify-content: flex-start;
        padding: 32px;
        z-index: 2147483647;
      }
      #${OVERLAY_ID}.show {
        display: flex;
        animation: overlay-fade ${DISPLAY_DURATION}ms ease forwards;
      }
      #${OVERLAY_ID} .runner {
        font-size: 64px;
        line-height: 1;
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
        animation: run-across 2.8s cubic-bezier(0.35, 0, 0.25, 1) infinite;
      }
      @keyframes run-across {
        0% { transform: translateX(-120vw) translateY(0); }
        50% { transform: translateX(10vw) translateY(-6px); }
        100% { transform: translateX(120vw) translateY(0); }
      }
      @keyframes overlay-fade {
        0% { opacity: 0; }
        5% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
      }
      #${OVERLAY_ID} .label {
        margin-left: 12px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(0,0,0,0.65);
        color: #fff;
        font-size: 14px;
        font-family: system-ui, -apple-system, sans-serif;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,0.1);
        animation: float 3s ease-in-out infinite;
      }
      @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
        100% { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = OVERLAY_ID;
      overlay.innerHTML = `
        <div class="runner" aria-hidden="true">🐇</div>
        <div class="label">Đến giờ rồi! Nghỉ ngơi 1 chút nhé.</div>
      `;
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function showRabbitOverlay(message) {
    console.log('[Elias Pomodoro] Show rabbit overlay', { message });
    ensureStyle();
    const overlay = ensureOverlay();
    const label = overlay.querySelector('.label');
    if (label && message) {
      label.textContent = message;
    }

    overlay.classList.add('show');

    setTimeout(() => {
      overlay.classList.remove('show');
    }, DISPLAY_DURATION);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    console.log('[Elias Pomodoro] Content script received message', msg);
    if (msg?.action === 'pomodoro:done') {
      const text = msg?.text || 'Đến giờ rồi! Nghỉ ngơi 1 chút nhé.';
      showRabbitOverlay(text);
    }
  });
})();

