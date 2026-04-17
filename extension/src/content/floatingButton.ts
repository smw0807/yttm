import { getCurrentTimeSec } from '../lib/youtube';

const BUTTON_ID = 'yttm-floating-btn';

export function injectFloatingButton(onCapture: (timestampSec: number) => void): () => void {
  removeFloatingButton();

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.title = '타임스탬프 메모 (Alt+M)';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
    <span style="font-size:11px;margin-left:4px;">메모</span>
  `;

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#ff0000',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    transition: 'transform 0.1s, opacity 0.1s',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.05)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
  });

  btn.addEventListener('click', () => {
    const ts = getCurrentTimeSec();
    onCapture(ts);
  });

  document.body.appendChild(btn);

  return () => removeFloatingButton();
}

export function removeFloatingButton(): void {
  document.getElementById(BUTTON_ID)?.remove();
}
