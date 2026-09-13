import type { Timestamp } from 'firebase/firestore';
import type {
  Video as SharedVideo,
  Memo as SharedMemo,
  WithId,
  YouTubeVideoInfo,
} from '../../../shared/types';

export type CreatedAt = Timestamp | number | null;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type Video = SharedVideo<CreatedAt>;
export type Memo = SharedMemo<CreatedAt>;

export type VideoWithId = WithId<Video>;
export type MemoWithId = WithId<Memo>;

// Extension message protocol
export type ExtMessage =
  // Content Script → Background
  | {
      type: 'VIDEO_CHANGED';
      payload: VideoInfo;
    }
  | { type: 'TIMESTAMP_CAPTURED'; payload: { timestampSec: number } }
  // Side Panel → Background
  | { type: 'GET_CURRENT_VIDEO' }
  | { type: 'REFRESH_CURRENT_VIDEO' }
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
  | { type: 'SEEK_TO'; payload: { timestampSec: number } }
  | { type: 'REQUEST_VIDEO_INFO' }
  // Side Panel → Content Script (직접)
  | { type: 'GET_CURRENT_TIME' };

export type VideoInfo = YouTubeVideoInfo;
