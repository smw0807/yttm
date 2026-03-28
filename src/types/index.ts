import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

export interface Video {
  id?: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
  userId: string;
  shareToken: string | null;
  createdAt: Timestamp;
}

export interface Memo {
  id?: string;
  timestampSec: number;
  content: string;
  createdAt: Timestamp;
}

export interface Collection {
  id?: string;
  name: string;
  description: string;
  videoIds: string[];
  userId: string;
  createdAt: Timestamp;
}

export interface YouTubeVideoInfo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}
