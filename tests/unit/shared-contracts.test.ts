import { describe, expect, expectTypeOf, it } from 'vitest';
import * as shared from '../../shared/utils/youtube';
import * as web from '@/lib/youtube';
import * as extension from '../../extension/src/lib/youtube';
import type {
  CreatedAt as WebCreatedAt,
  Video as WebVideo,
  Memo as WebMemo,
  VideoWithId as WebVideoWithId,
  YouTubeVideoInfo,
} from '@/types';
import type {
  CreatedAt as ExtensionCreatedAt,
  Video as ExtensionVideo,
  Memo as ExtensionMemo,
  MemoWithId as ExtensionMemoWithId,
  ExtMessage,
  VideoInfo,
} from '../../extension/src/types';

describe('shared entry points', () => {
  it.each(['extractYouTubeId', 'formatTimestamp', 'parseDuration'] as const)(
    'both apps expose the shared %s implementation',
    (name) => {
      expect(web[name]).toBe(shared[name]);
      expect(extension[name]).toBe(shared[name]);
    },
  );

  it('keeps the web validation and thumbnail exports', () => {
    expect(web.isValidYouTubeId).toBe(shared.isValidYouTubeId);
    expect(web.pickYouTubeThumbnail).toBe(shared.pickYouTubeThumbnail);
    expect(web.YOUTUBE_ID_REGEX).toBe(shared.YOUTUBE_ID_REGEX);
  });
});

// These assertions are checked by yarn typecheck, in addition to the runtime tests.
it('preserves shared document shapes and platform timestamp contracts', () => {
  expectTypeOf<YouTubeVideoInfo>().toEqualTypeOf<VideoInfo>();
  expectTypeOf<Omit<WebVideo, 'createdAt'>>().toEqualTypeOf<Omit<ExtensionVideo, 'createdAt'>>();
  expectTypeOf<Omit<WebMemo, 'createdAt'>>().toEqualTypeOf<Omit<ExtensionMemo, 'createdAt'>>();
  expectTypeOf<WebVideo['createdAt']>().toEqualTypeOf<WebCreatedAt>();
  expectTypeOf<WebMemo['createdAt']>().toEqualTypeOf<WebCreatedAt>();
  expectTypeOf<ExtensionVideo['createdAt']>().toEqualTypeOf<ExtensionCreatedAt>();
  expectTypeOf<ExtensionMemo['createdAt']>().toEqualTypeOf<ExtensionCreatedAt>();
  expectTypeOf<Extract<WebCreatedAt, null>>().toEqualTypeOf<never>();
  expectTypeOf<Extract<ExtensionCreatedAt, null>>().toEqualTypeOf<null>();
  expectTypeOf<WebVideo['id']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<WebVideoWithId['id']>().toEqualTypeOf<string>();
  expectTypeOf<ExtensionMemoWithId['id']>().toEqualTypeOf<string>();
  expectTypeOf<
    Extract<ExtMessage, { type: 'VIDEO_CHANGED' }>['payload']
  >().toEqualTypeOf<YouTubeVideoInfo>();
});
