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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Video, Memo, Collection } from '@/types';

// Videos
export async function getVideos(userId: string) {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Video);
}

export async function getVideo(videoId: string) {
  const snap = await getDoc(doc(db, 'videos', videoId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Video;
}

export async function addVideo(video: Omit<Video, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'videos'), {
    ...video,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteVideo(videoId: string) {
  await deleteDoc(doc(db, 'videos', videoId));
}

export async function updateVideoShareToken(videoId: string, token: string | null) {
  await updateDoc(doc(db, 'videos', videoId), { shareToken: token });
}

export async function getVideoByShareToken(token: string) {
  const q = query(collection(db, 'videos'), where('shareToken', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Video;
}

// Memos
export async function getMemos(videoId: string) {
  const q = query(collection(db, 'videos', videoId, 'memos'), orderBy('timestampSec', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Memo);
}

export async function addMemo(videoId: string, memo: Omit<Memo, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'videos', videoId, 'memos'), {
    ...memo,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMemo(videoId: string, memoId: string, content: string) {
  await updateDoc(doc(db, 'videos', videoId, 'memos', memoId), { content });
}

export async function deleteMemo(videoId: string, memoId: string) {
  await deleteDoc(doc(db, 'videos', videoId, 'memos', memoId));
}

// Collections
export async function getCollections(userId: string) {
  const q = query(
    collection(db, 'collections'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Collection);
}

export async function addCollection(col: Omit<Collection, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'collections'), {
    ...col,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCollection(colId: string, data: Partial<Collection>) {
  await updateDoc(doc(db, 'collections', colId), data);
}

export async function deleteCollection(colId: string) {
  await deleteDoc(doc(db, 'collections', colId));
}
