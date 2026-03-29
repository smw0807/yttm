import { Timestamp } from 'firebase/firestore';

// SC → CC 경계에서 Timestamp 클래스는 직렬화 불가 → number(ms)도 허용
export type CreatedAt = Timestamp | number;

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: CreatedAt;
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

export interface Collection {
  id?: string;
  name: string;
  description: string;
  videoIds: string[];
  userId: string;
  createdAt: CreatedAt;
}

export interface YouTubeVideoInfo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}
