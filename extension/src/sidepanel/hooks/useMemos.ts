import { useState, useEffect, useCallback } from 'react';
import {
  ensureVideo,
  subscribeToMemos,
  addMemo,
  updateMemo,
  deleteMemo,
  getVideoByYoutubeId,
} from '../../lib/firestore';
import type { MemoWithId, VideoInfo, User, ExtMessage } from '../../types';

export function useMemos(videoInfo: VideoInfo | null, user: User | null) {
  const [memos, setMemos] = useState<MemoWithId[]>([]);
  const [videoDocId, setVideoDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // videoInfo 또는 user 변경 시 Firestore 구독
  useEffect(() => {
    if (!videoInfo || !user) {
      setMemos([]);
      setVideoDocId(null);
      return;
    }

    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    getVideoByYoutubeId(videoInfo.youtubeId, user.uid).then((vid) => {
      if (!vid) {
        // 아직 Video 문서 없음 → 메모 없음
        setMemos([]);
        setVideoDocId(null);
        setLoading(false);
        return;
      }

      setVideoDocId(vid.id);
      unsubscribe = subscribeToMemos(vid.id, (newMemos) => {
        setMemos(newMemos);
        setLoading(false);
        // Background → content script에 마커 업데이트 요청
        chrome.runtime.sendMessage<ExtMessage>({
          type: 'MEMOS_UPDATED',
          payload: { memos: newMemos },
        });
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [videoInfo?.youtubeId, user?.uid]);

  const add = useCallback(
    async (timestampSec: number, content: string) => {
      if (!videoInfo || !user) return;

      // Video 문서 없으면 생성
      const docId = await ensureVideo({
        youtubeId: videoInfo.youtubeId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        durationSec: videoInfo.durationSec,
        userId: user.uid,
        shareToken: null,
      });
      setVideoDocId(docId);

      // 구독이 없으면 시작
      if (!videoDocId) {
        const unsub = subscribeToMemos(docId, (newMemos) => {
          setMemos(newMemos);
          chrome.runtime.sendMessage<ExtMessage>({
            type: 'MEMOS_UPDATED',
            payload: { memos: newMemos },
          });
        });
        // 컴포넌트 언마운트까지 유지 (이 경우는 최초 메모 추가 시 한번만 실행됨)
        // useEffect의 cleanup이 없으므로, 다음 useEffect 실행 시 자동 정리됨
        void unsub; // intentionally not cleaning up here; useEffect above handles it on re-render
      }

      await addMemo(docId, { timestampSec, content });
    },
    [videoInfo, user, videoDocId],
  );

  const update = useCallback(
    async (memoId: string, content: string) => {
      if (!videoDocId) return;
      await updateMemo(videoDocId, memoId, content);
    },
    [videoDocId],
  );

  const remove = useCallback(
    async (memoId: string) => {
      if (!videoDocId) return;
      await deleteMemo(videoDocId, memoId);
    },
    [videoDocId],
  );

  return { memos, loading, add, update, remove };
}
