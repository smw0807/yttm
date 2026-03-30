'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── YouTube IFrame API 타입 ──────────────────────────────────────────────────
interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        container: HTMLElement,
        options: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// ── API 로더 (싱글턴) ─────────────────────────────────────────────────────────
let apiReady = false;
const pendingResolvers: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) return resolve();
    pendingResolvers.push(resolve);

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      window.onYouTubeIframeAPIReady = () => {
        apiReady = true;
        pendingResolvers.forEach((fn) => fn());
        pendingResolvers.length = 0;
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useYouTubePlayer(youtubeId: string) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!youtubeId) return;
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youtubeId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            if (!destroyed) setReady(true);
          },
        },
      });
    });

    return () => {
      destroyed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
    };
  }, [youtubeId]);

  const getCurrentTime = useCallback(
    () => Math.floor(playerRef.current?.getCurrentTime() ?? 0),
    [],
  );

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    playerRef.current?.playVideo();
  }, []);

  return { containerRef, ready, getCurrentTime, seekTo };
}
