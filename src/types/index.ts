import type { Timestamp } from 'firebase/firestore';
import type { Video as SharedVideo, Memo as SharedMemo, WithId } from '../../shared/types';

export type { YouTubeVideoInfo } from '../../shared/types';

// SC → CC 경계에서 Timestamp 클래스는 직렬화 불가 → number(ms)도 허용
export type CreatedAt = Timestamp | number;

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: CreatedAt;
}

export type Video = SharedVideo<CreatedAt>;
export type Memo = SharedMemo<CreatedAt>;

export interface Collection {
  id?: string;
  name: string;
  description: string;
  videoIds: string[];
  userId: string;
  createdAt: CreatedAt;
}

// Convenience types for Firestore documents that always have an id
export type VideoWithId = WithId<Video>;
export type MemoWithId = WithId<Memo>;
export type CollectionWithId = WithId<Collection>;
