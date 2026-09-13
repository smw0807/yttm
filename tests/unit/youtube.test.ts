import { describe, expect, it } from 'vitest';
import {
  extractYouTubeId,
  isValidYouTubeId,
  parseDuration,
  formatTimestamp,
  pickYouTubeThumbnail,
} from '../../shared/utils/youtube';

describe('YouTube video input and timeline', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  ])('extracts the video ID from %s', (url) => {
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ');
  });
  it.each(['', 'https://example.com', 'not a video'])('rejects non-video input %s', (url) => {
    expect(extractYouTubeId(url)).toBeNull();
  });
  it.each(['short', '123456789012', 'abcdefghij!', '../some/path'])(
    'rejects invalid ID %s',
    (id) => {
      expect(isValidYouTubeId(id)).toBe(false);
    },
  );
  it.each([
    ['PT0S', 0],
    ['PT59S', 59],
    ['PT1M', 60],
    ['PT1H2M3S', 3723],
    ['invalid', 0],
  ])('parses %s', (input, seconds) => {
    expect(parseDuration(input)).toBe(seconds);
  });
  it.each([
    [0, '0:00'],
    [59, '0:59'],
    [60, '1:00'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3723, '1:02:03'],
  ])('formats %s seconds', (seconds, label) => {
    expect(formatTimestamp(seconds)).toBe(label);
  });
  it('uses available thumbnails in preference order', () => {
    const thumbnails = { high: { url: 'high' }, medium: { url: 'medium' } };
    expect(pickYouTubeThumbnail(thumbnails)).toBe('high');
    expect(pickYouTubeThumbnail(thumbnails, ['medium', 'default'])).toBe('medium');
    expect(pickYouTubeThumbnail({})).toBe('');
  });
});
