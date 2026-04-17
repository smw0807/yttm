import type { Timestamp } from 'firebase/firestore';

export type CreatedAt = Timestamp | number | null;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Video {
  id?: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
  userId: string;
  shareToken: string | null;
  createdAt: CreatedAt;
}

export interface Memo {
  id?: string;
  timestampSec: number;
  content: string;
  createdAt: CreatedAt;
}

export type VideoWithId = Video & { id: string };
export type MemoWithId = Memo & { id: string };

// Extension message protocol
export type ExtMessage =
  // Content Script → Background
  | { type: 'VIDEO_CHANGED'; payload: { youtubeId: string; title: string; thumbnail: string; durationSec: number } }
  | { type: 'TIMESTAMP_CAPTURED'; payload: { timestampSec: number } }
  // Side Panel → Background
  | { type: 'GET_CURRENT_VIDEO' }
  | { type: 'SIGN_IN' }
  | { type: 'SIGN_OUT' }
  | { type: 'MEMOS_UPDATED'; payload: { memos: MemoWithId[] } }
  // Popup → Background
  | { type: 'GET_AUTH_STATE' }
  | { type: 'OPEN_SIDE_PANEL' }
  // Background → Side Panel / Popup (responses)
  | { type: 'CURRENT_VIDEO_UPDATE'; payload: { video: VideoInfo | null } }
  | { type: 'TIMESTAMP_READY'; payload: { timestampSec: number } }
  | { type: 'AUTH_STATE_CHANGED'; payload: { user: User | null } }
  // Background → Content Script
  | { type: 'RENDER_MARKERS'; payload: { memos: MemoWithId[]; durationSec: number } }
  | { type: 'SEEK_TO'; payload: { timestampSec: number } };

export interface VideoInfo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}
