// Refuse to use a real Firebase project or an externally supplied emulator address.
export const projectId = 'demo-yttm-tests';
export const emulatorHost = '127.0.0.1:8085';

export function requireEmulator() {
  if (process.env.FIRESTORE_EMULATOR_HOST !== emulatorHost) {
    throw new Error('Run yarn test:emulator: expected local Firestore emulator on 127.0.0.1:8085');
  }
}
