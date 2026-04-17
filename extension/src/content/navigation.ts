type NavigationCallback = () => void;

/**
 * YouTube SPA 네비게이션 감지
 * yt-navigate-finish: YouTube가 SPA 라우트 완료 후 DOM 안정화 시 발생
 */
export function onYouTubeNavigate(callback: NavigationCallback): () => void {
  const handler = () => {
    // DOM이 완전히 로드되길 잠깐 기다림
    setTimeout(callback, 500);
  };

  document.addEventListener('yt-navigate-finish', handler);

  // 초기 로드 (이미 /watch 페이지인 경우)
  if (location.pathname === '/watch') {
    setTimeout(callback, 1000);
  }

  return () => {
    document.removeEventListener('yt-navigate-finish', handler);
  };
}
