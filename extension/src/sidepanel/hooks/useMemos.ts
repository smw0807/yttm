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

interface MemoState {
  key: string;
  videoDocId: string | null;
  memos: MemoWithId[];
}

export function useMemos(videoInfo: VideoInfo | null, user: User | null) {
  const youtubeId = videoInfo?.youtubeId;
  const uid = user?.uid;
  const key = youtubeId && uid ? JSON.stringify([uid, youtubeId]) : null;
  const [state, setState] = useState<MemoState | null>(null);
  const [createdVideo, setCreatedVideo] = useState<{ key: string; id: string } | null>(null);
  const createdId = createdVideo?.key === key ? createdVideo?.id : undefined;
  const current = state?.key === key ? state : null;
  const videoDocId = current?.videoDocId ?? null;

  useEffect(() => {
    if (!youtubeId || !uid || !key) return;
    const subscriptionKey = key;
    const subscriptionYoutubeId = youtubeId;
    const subscriptionUid = uid;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    function handleError(error: Error) {
      if (!active) return;
      console.error('[memos]', error);
      setState({ key: subscriptionKey, videoDocId: null, memos: [] });
    }

    async function subscribe() {
      const id =
        createdId ?? (await getVideoByYoutubeId(subscriptionYoutubeId, subscriptionUid))?.id;
      if (!active) return;
      if (!id) {
        setState({ key: subscriptionKey, videoDocId: null, memos: [] });
        return;
      }
      unsubscribe = subscribeToMemos(
        id,
        (memos) => {
          if (!active) return;
          setState({ key: subscriptionKey, videoDocId: id, memos });
          chrome.runtime
            .sendMessage<ExtMessage>({ type: 'MEMOS_UPDATED', payload: { memos } })
            .catch(() => {});
        },
        handleError,
      );
    }

    void subscribe().catch(handleError);
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [youtubeId, uid, key, createdId]);

  const add = useCallback(
    async (timestampSec: number, content: string) => {
      if (!videoInfo || !user || !key) return;
      const docId =
        videoDocId ??
        (await ensureVideo({
          youtubeId: videoInfo.youtubeId,
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnail,
          durationSec: videoInfo.durationSec,
          userId: user.uid,
          shareToken: null,
        }));
      await addMemo(docId, { timestampSec, content });
      // The effect owns every subscription, including the first memo's new video.
      if (!videoDocId) setCreatedVideo({ key, id: docId });
    },
    [videoInfo, user, key, videoDocId],
  );

  const update = useCallback(
    async (memoId: string, content: string) => {
      if (videoDocId) await updateMemo(videoDocId, memoId, content);
    },
    [videoDocId],
  );

  const remove = useCallback(
    async (memoId: string) => {
      if (videoDocId) await deleteMemo(videoDocId, memoId);
    },
    [videoDocId],
  );

  return {
    memos: current?.memos ?? [],
    loading: key !== null && current === null,
    add,
    update,
    remove,
  };
}
