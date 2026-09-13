export function getGuestUpgradeErrorKey(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  switch (code) {
    case 'auth/popup-blocked':
      return 'connectPopupBlocked';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'connectCancelled';
    case 'auth/network-request-failed':
      return 'connectNetworkError';
    default:
      return 'connectFailed';
  }
}
