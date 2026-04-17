import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Video, Memo, VideoWithId, MemoWithId } from '../types';

// Videos
export async function getVideos(userId: string): Promise<VideoWithId[]> {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as VideoWithId);
}

export async function getVideo(videoDocId: string): Promise<VideoWithId | null> {
  const snap = await getDoc(doc(db, 'videos', videoDocId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as VideoWithId;
}

/**
 * youtubeId로 userId의 비디오 조회
 */
export async function getVideoByYoutubeId(
  youtubeId: string,
  userId: string,
): Promise<VideoWithId | null> {
  const q = query(
    collection(db, 'videos'),
    where('youtubeId', '==', youtubeId),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as VideoWithId;
}

/**
 * 첫 메모 저장 시 Video 문서 생성 (upsert)
 */
export async function ensureVideo(video: Omit<Video, 'id' | 'createdAt'>): Promise<string> {
  const existing = await getVideoByYoutubeId(video.youtubeId, video.userId);
  if (existing) return existing.id;

  const ref = await addDoc(collection(db, 'videos'), {
    ...video,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Memos
export async function getMemos(videoDocId: string): Promise<MemoWithId[]> {
  const q = query(
    collection(db, 'videos', videoDocId, 'memos'),
    orderBy('timestampSec', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MemoWithId);
}

export function subscribeToMemos(
  videoDocId: string,
  callback: (memos: MemoWithId[]) => void,
): () => void {
  const q = query(
    collection(db, 'videos', videoDocId, 'memos'),
    orderBy('timestampSec', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    const memos = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MemoWithId);
    callback(memos);
  });
}

export async function addMemo(
  videoDocId: string,
  memo: Omit<Memo, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'videos', videoDocId, 'memos'), {
    ...memo,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMemo(
  videoDocId: string,
  memoId: string,
  content: string,
): Promise<void> {
  await updateDoc(doc(db, 'videos', videoDocId, 'memos', memoId), { content });
}

export async function deleteMemo(videoDocId: string, memoId: string): Promise<void> {
  await deleteDoc(doc(db, 'videos', videoDocId, 'memos', memoId));
}
