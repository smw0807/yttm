import { beforeEach, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  getApps: vi.fn(),
  getApp: vi.fn(),
  initializeApp: vi.fn(),
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
}));
vi.mock('firebase/app', () => ({
  getApps: sdk.getApps,
  getApp: sdk.getApp,
  initializeApp: sdk.initializeApp,
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: sdk.getFirestore,
  connectFirestoreEmulator: sdk.connectFirestoreEmulator,
}));
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  sdk.getApps.mockReturnValue([]);
  sdk.initializeApp.mockReturnValue({ name: 'demo', options: { projectId: 'demo-yttm-e2e' } });
  sdk.getFirestore.mockReturnValue({ name: 'db' });
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_EMULATORS', '1');
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'demo-yttm-e2e');
  vi.stubEnv('NODE_ENV', 'development');
});
it('connects only the fixed demo database to the local emulator', async () => {
  await import('@/lib/firebase/config');
  expect(sdk.connectFirestoreEmulator).toHaveBeenCalledWith({ name: 'db' }, '127.0.0.1', 8086);
});
it('rejects emulator mode for a production build', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  await expect(import('@/lib/firebase/config')).rejects.toThrow('development mode');
  expect(sdk.initializeApp).not.toHaveBeenCalled();
});
it('rejects emulator mode with a non-demo project', async () => {
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'real-project');
  await expect(import('@/lib/firebase/config')).rejects.toThrow('demo-yttm-e2e');
  expect(sdk.initializeApp).not.toHaveBeenCalled();
});
it('leaves normal application configuration unchanged when the flag is absent', async () => {
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_EMULATORS', undefined);
  await import('@/lib/firebase/config');
  expect(sdk.initializeApp).toHaveBeenCalledOnce();
  expect(sdk.connectFirestoreEmulator).not.toHaveBeenCalled();
});
it('refuses to reuse an existing non-demo Firebase app', async () => {
  sdk.getApps.mockReturnValue([{}]);
  sdk.getApp.mockReturnValue({ options: { projectId: 'real-project' } });
  await expect(import('@/lib/firebase/config')).rejects.toThrow('existing Firebase app');
  expect(sdk.getFirestore).not.toHaveBeenCalled();
});
