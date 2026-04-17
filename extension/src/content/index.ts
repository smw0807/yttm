import { extractYouTubeId, extractVideoMetaFromDOM, getCurrentTimeSec } from '../lib/youtube';
import { onYouTubeNavigate } from './navigation';
import { injectFloatingButton, removeFloatingButton } from './floatingButton';
import { renderProgressMarkers, removeProgressMarkers } from './progressBar';
import type { ExtMessage, MemoWithId } from '../types';

let cleanupNav: (() => void) | null = null;
let cleanupBtn: (() => void) | null = null;
let cleanupMarkers: (() => void) | null = null;
let currentVideoId: string | null = null;

function isWatchPage(): boolean {
  return location.pathname === '/watch' && !!new URLSearchParams(location.search).get('v');
}

function captureTimestamp(timestampSec: number): void {
  chrome.runtime.sendMessage<ExtMessage>({
    type: 'TIMESTAMP_CAPTURED',
    payload: { timestampSec },
  });
}

function handlePageChange(): void {
  cleanup();

  if (!isWatchPage()) return;

  const youtubeId = extractYouTubeId(location.href);
  if (!youtubeId) return;

  // 메타데이터 추출 (DOM이 충분히 로드됐을 때)
  const meta = extractVideoMetaFromDOM();
  const title = meta?.title ?? document.title.replace(' - YouTube', '');
  const thumbnail = meta?.thumbnail ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  const durationSec = meta?.durationSec ?? 0;

  currentVideoId = youtubeId;

  // Background에 영상 변경 알림
  chrome.runtime.sendMessage<ExtMessage>({
    type: 'VIDEO_CHANGED',
    payload: { youtubeId, title, thumbnail, durationSec },
  });

  // 플로팅 버튼 주입
  cleanupBtn = injectFloatingButton(captureTimestamp);
}

function cleanup(): void {
  cleanupBtn?.();
  cleanupBtn = null;
  cleanupMarkers?.();
  cleanupMarkers = null;
  currentVideoId = null;
}

// Background/사이드패널에서 오는 메시지 처리
chrome.runtime.onMessage.addListener((message: ExtMessage, _sender, sendResponse) => {
  switch (message.type) {
    case 'RENDER_MARKERS': {
      cleanupMarkers?.();
      cleanupMarkers = renderProgressMarkers(message.payload.memos, message.payload.durationSec);
      break;
    }
    case 'SEEK_TO': {
      const videoEl = document.querySelector('video.html5-main-video') as HTMLVideoElement | null;
      if (videoEl) videoEl.currentTime = message.payload.timestampSec;
      break;
    }
    case 'GET_CURRENT_TIME': {
      sendResponse({ timestampSec: getCurrentTimeSec() });
      break;
    }
  }
});

// Alt+M 단축키
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'm' && isWatchPage()) {
    captureTimestamp(getCurrentTimeSec());
  }
});

// SPA 네비게이션 감지 시작
cleanupNav = onYouTubeNavigate(handlePageChange);
