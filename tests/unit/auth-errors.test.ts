import { expect, it } from 'vitest';
import { getGuestUpgradeErrorKey } from '@/lib/firebase/auth-errors';
import ko from '../../messages/ko.json';
import en from '../../messages/en.json';

it.each([
  ['auth/popup-blocked', 'connectPopupBlocked'],
  ['auth/popup-closed-by-user', 'connectCancelled'],
  ['auth/cancelled-popup-request', 'connectCancelled'],
  ['auth/network-request-failed', 'connectNetworkError'],
  ['auth/unknown', 'connectFailed'],
] as const)('maps %s to a localized safe message', (code, key) => {
  expect(getGuestUpgradeErrorKey({ code, accessToken: 'must-not-be-rendered' })).toBe(key);
  expect(ko.auth[key]).toBeTruthy();
  expect(en.auth[key]).toBeTruthy();
});
it.each([null, undefined, 'secret-error-text', new Error('secret-error-text')])(
  'handles unknown errors without displaying their raw contents',
  (error) => {
    expect(getGuestUpgradeErrorKey(error)).toBe('connectFailed');
  },
);
it('keeps auth translation keys aligned', () => {
  expect(Object.keys(ko.auth).sort()).toEqual(Object.keys(en.auth).sort());
});
