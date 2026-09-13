import { describe, expect, it, vi } from 'vitest';
import { extractVideoMetaFromDOM, getCurrentTimeSec } from '../../extension/src/lib/youtube';

function stubPage({
  title = '  Video title  ',
  titleSelector = 'h1.ytd-video-primary-info-renderer yt-formatted-string',
  url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  video = { duration: 125.8, currentTime: 65.9 } as {
    duration: number;
    currentTime: number;
  } | null,
} = {}) {
  vi.stubGlobal('location', { href: url });
  vi.stubGlobal('document', {
    querySelector: vi.fn((selector: string) => {
      if (selector === titleSelector) return { textContent: title };
      if (selector === 'video.html5-main-video') return video;
      return null;
    }),
  });
}

describe('extension DOM adapter', () => {
  it.each([
    'h1.ytd-video-primary-info-renderer yt-formatted-string',
    'h1.ytd-watch-metadata yt-formatted-string',
    '#above-the-fold #title yt-formatted-string',
  ])('reads metadata with title selector %s', (titleSelector) => {
    stubPage({ titleSelector });
    expect(extractVideoMetaFromDOM()).toEqual({
      title: 'Video title',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      durationSec: 125,
    });
  });

  it.each([{ title: '' }, { url: 'https://www.youtube.com/' }])(
    'requires both a title and video ID: %j',
    (page) => {
      stubPage(page);
      expect(extractVideoMetaFromDOM()).toBeNull();
    },
  );

  it('keeps missing player fallbacks', () => {
    stubPage({ video: null });
    expect(extractVideoMetaFromDOM()?.durationSec).toBe(0);
    expect(getCurrentTimeSec()).toBe(0);
  });

  it('uses zero until duration is available', () => {
    stubPage({ video: { duration: NaN, currentTime: 0 } });
    expect(extractVideoMetaFromDOM()?.durationSec).toBe(0);
  });

  it('captures the current playback time in whole seconds', () => {
    stubPage();
    expect(getCurrentTimeSec()).toBe(65);
  });
});
