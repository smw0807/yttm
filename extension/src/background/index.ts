import { onAuthStateChanged } from 'firebase/auth/web-extension';
import { auth } from '../lib/firebase';
import { signInWithGoogle, signOut } from '../lib/auth';
import { extractYouTubeId } from '../lib/youtube';
import type { ExtMessage, User, VideoInfo, MemoWithId } from '../types';

// 상태 (Background = 단일 상태 허브)
let currentUser: User | null = null;
let currentVideo: VideoInfo | null = null;
let pendingTimestamp: number | null = null;

const YOUTUBE_WATCH_URL_PATTERNS = [
  'https://www.youtube.com/watch*',
  'https://m.youtube.com/watch*',
];

// Firebase Auth 상태 구독
onAuthStateChanged(auth, (firebaseUser) => {
  currentUser = firebaseUser
    ? {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }
    : null;

  // 사이드패널 + 팝업에 브로드캐스트
  broadcastToExtension({ type: 'AUTH_STATE_CHANGED', payload: { user: currentUser } });

  // chrome.storage에 캐시
  chrome.storage.local.set({ user: currentUser });
});

// 메시지 라우터
chrome.runtime.onMessage.addListener(
  (message: ExtMessage, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true; // async response 허용
  },
);

async function handleMessage(
  message: ExtMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) {
  switch (message.type) {
    case 'VIDEO_CHANGED': {
      currentVideo = message.payload;
      pendingTimestamp = null;
      broadcastToExtension({
        type: 'CURRENT_VIDEO_UPDATE',
        payload: { video: currentVideo },
      });
      sendResponse({ ok: true });
      break;
    }

    case 'TIMESTAMP_CAPTURED': {
      pendingTimestamp = message.payload.timestampSec;
      broadcastToExtension({
        type: 'TIMESTAMP_READY',
        payload: { timestampSec: pendingTimestamp },
      });
      // 사이드패널 열기
      if (sender.tab?.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      }
      sendResponse({ ok: true });
      break;
    }

    case 'GET_CURRENT_VIDEO': {
      sendResponse({ video: currentVideo, user: currentUser });
      break;
    }

    case 'REFRESH_CURRENT_VIDEO': {
      const tab = await findBestYouTubeTab();
      if (!tab?.id) {
        sendResponse({ ok: false });
        break;
      }

      const refreshed = await sendToContentScript(tab.id, { type: 'REQUEST_VIDEO_INFO' });
      if (refreshed) {
        sendResponse({ ok: true });
        break;
      }

      const fallbackVideo = buildVideoInfoFromTab(tab);
      if (!fallbackVideo) {
        sendResponse({ ok: false });
        break;
      }

      currentVideo = fallbackVideo;
      broadcastToExtension({
        type: 'CURRENT_VIDEO_UPDATE',
        payload: { video: currentVideo },
      });
      sendResponse({ ok: true, fallback: true });
      break;
    }

    case 'GET_AUTH_STATE': {
      sendResponse({ user: currentUser });
      break;
    }

    case 'SIGN_IN': {
      try {
        console.info('[background] SIGN_IN requested');
        await signInWithGoogle();
        console.info('[background] SIGN_IN succeeded', {
          uid: auth.currentUser?.uid ?? null,
          email: auth.currentUser?.email ?? null,
        });
        sendResponse({ ok: true });
      } catch (err) {
        console.error('[background] SIGN_IN failed', err);
        sendResponse({ ok: false, error: String(err) });
      }
      break;
    }

    case 'SIGN_OUT': {
      try {
        console.info('[background] SIGN_OUT requested');
        await signOut();
        sendResponse({ ok: true });
      } catch (err) {
        console.error('[background] SIGN_OUT failed', err);
        sendResponse({ ok: false, error: String(err) });
      }
      break;
    }

    case 'MEMOS_UPDATED': {
      // 사이드패널이 메모 업데이트 알림 → 현재 탭의 content script에 마커 렌더링 요청
      if (currentVideo) {
        const { memos } = message.payload;
        await sendToActiveContentScript({
          type: 'RENDER_MARKERS',
          payload: { memos, durationSec: currentVideo.durationSec },
        });
      }
      sendResponse({ ok: true });
      break;
    }

    case 'OPEN_SIDE_PANEL': {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
      }
      sendResponse({ ok: true });
      break;
    }

    default:
      sendResponse({ ok: false, error: 'unknown message type' });
  }
}

// 모든 extension 뷰(사이드패널, 팝업)에 브로드캐스트
function broadcastToExtension(message: ExtMessage) {
  chrome.runtime.sendMessage(message).catch(() => {
    // 수신자 없으면 무시
  });
}

// 현재 활성 YouTube 탭의 content script에 메시지 전송
async function sendToActiveContentScript(message: ExtMessage) {
  const tab = await findBestYouTubeTab();
  if (!tab?.id) {
    return false;
  }

  return sendToContentScript(tab.id, message);
}

async function sendToContentScript(tabId: number, message: ExtMessage) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch {
    // content script 미로드 시 무시
    return false;
  }
}

async function findBestYouTubeTab() {
  const [currentWindowTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (isYouTubeWatchTab(currentWindowTab)) {
    return currentWindowTab;
  }

  const [lastFocusedWindowTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (isYouTubeWatchTab(lastFocusedWindowTab)) {
    return lastFocusedWindowTab;
  }

  const [matchedTab] = await chrome.tabs.query({ url: YOUTUBE_WATCH_URL_PATTERNS });
  return matchedTab;
}

function isYouTubeWatchTab(tab: chrome.tabs.Tab | undefined) {
  return Boolean(tab?.id && tab.url && extractYouTubeId(tab.url));
}

function buildVideoInfoFromTab(tab: chrome.tabs.Tab): VideoInfo | null {
  const youtubeId = tab.url ? extractYouTubeId(tab.url) : null;
  if (!youtubeId) {
    return null;
  }

  const rawTitle = (tab.title ?? '').trim();
  const title =
    rawTitle.replace(/\s*-\s*YouTube$/i, '').trim() || `YouTube Video ${youtubeId}`;

  return {
    youtubeId,
    title,
    thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    durationSec: 0,
  };
}

// 익스텐션 설치/업데이트 시 sidePanel 동작 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(console.error);
});
