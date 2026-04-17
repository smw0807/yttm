import type { MemoWithId } from '../types';

const CONTAINER_ID = 'yttm-progress-markers';

/**
 * YouTube 프로그레스 바 위에 메모 마커(빨간 점) 오버레이 렌더링
 * 클릭 시 해당 시점으로 영상 이동
 */
export function renderProgressMarkers(memos: MemoWithId[], durationSec: number): () => void {
  removeProgressMarkers();

  if (durationSec <= 0 || memos.length === 0) return () => {};

  const progressBar = findProgressBar();
  if (!progressBar) return () => {};

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  Object.assign(container.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '10',
  });

  memos.forEach((memo) => {
    const pct = (memo.timestampSec / durationSec) * 100;
    const marker = document.createElement('div');
    marker.title = `${formatTs(memo.timestampSec)}: ${memo.content}`;

    Object.assign(marker.style, {
      position: 'absolute',
      top: '50%',
      left: `${pct}%`,
      transform: 'translate(-50%, -50%)',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#ff0000',
      cursor: 'pointer',
      pointerEvents: 'auto',
      boxShadow: '0 0 0 2px rgba(255,0,0,0.4)',
      zIndex: '11',
      transition: 'transform 0.1s',
    });

    marker.addEventListener('mouseenter', () => {
      marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    marker.addEventListener('mouseleave', () => {
      marker.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      seekTo(memo.timestampSec);
    });

    container.appendChild(marker);
  });

  // progressBar가 relative/absolute 포지셔닝인지 확인 후 적용
  const barStyle = getComputedStyle(progressBar);
  if (barStyle.position === 'static') {
    (progressBar as HTMLElement).style.position = 'relative';
  }
  progressBar.appendChild(container);

  return () => removeProgressMarkers();
}

export function removeProgressMarkers(): void {
  document.getElementById(CONTAINER_ID)?.remove();
}

function findProgressBar(): Element | null {
  // YouTube 프로그레스 바 셀렉터 (버전에 따라 다를 수 있음)
  return (
    document.querySelector('.ytp-progress-bar') ||
    document.querySelector('.ytp-timed-markers-container')?.parentElement ||
    null
  );
}

function seekTo(timestampSec: number): void {
  const videoEl = document.querySelector('video.html5-main-video') as HTMLVideoElement | null;
  if (videoEl) {
    videoEl.currentTime = timestampSec;
  }
}

function formatTs(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
