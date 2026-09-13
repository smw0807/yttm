// Platform-independent data models. Each app supplies its own timestamp type.
export interface YouTubeVideoInfo {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}

export interface Video<TCreatedAt> extends YouTubeVideoInfo {
  id?: string;
  userId: string;
  shareToken: string | null;
  createdAt: TCreatedAt;
}

export interface Memo<TCreatedAt> {
  id?: string;
  timestampSec: number;
  content: string;
  createdAt: TCreatedAt;
}

export type WithId<T extends { id?: string }> = T & { id: string };
