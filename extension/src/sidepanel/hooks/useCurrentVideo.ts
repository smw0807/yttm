import { useState, useEffect } from 'react';
import type { VideoInfo, ExtMessage } from '../../types';

export function useCurrentVideo() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  useEffect(() => {
    // 초기 상태 요청
    chrome.runtime.sendMessage<ExtMessage>({ type: 'GET_CURRENT_VIDEO' }, (res) => {
      if (res?.video) setVideoInfo(res.video);
    });

    // 이후 변경 구독
    const listener = (message: ExtMessage) => {
      if (message.type === 'CURRENT_VIDEO_UPDATE') {
        setVideoInfo(message.payload.video);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return videoInfo;
}
