// All child processes use a fixed demo project. No .env.local credentials are used.
import { generateKeyPairSync } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

for (const port of [3100, 8086, 9098]) {
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', () =>
      reject(new Error(`E2E port ${port} is already in use; refusing to reuse it`)),
    );
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}
const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_FIREBASE_EMULATORS: '1',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'demo-not-a-real-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-yttm-e2e.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-yttm-e2e',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-yttm-e2e.appspot.com',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:1234567890:web:e2e',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3100',
  NEXT_PUBLIC_ADFIT_UNIT: '',
  NEXT_PUBLIC_ADSENSE_CLIENT: '',
  YOUTUBE_API_KEY: '',
  ADMIN_UID: 'e2e-admin',
  GCLOUD_PROJECT: 'demo-yttm-e2e',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8086',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9098',
  FIREBASE_ADMIN_SDK: Buffer.from(
    JSON.stringify({
      project_id: 'demo-yttm-e2e',
      client_email: 'e2e@demo-yttm-e2e.iam.gserviceaccount.com',
      private_key: privateKey,
    }),
  ).toString('base64'),
  E2E_LIVE_YOUTUBE: process.argv.includes('--live-youtube') ? '1' : '0',
};
const command = process.argv.includes('--serve')
  ? 'node node_modules/next/dist/bin/next dev --hostname localhost --port 3100'
  : 'node node_modules/@playwright/test/cli.js test';
const child = spawn(
  process.execPath,
  [
    'node_modules/firebase-tools/lib/bin/firebase.js',
    'emulators:exec',
    '--only',
    'auth,firestore',
    '--project',
    'demo-yttm-e2e',
    '--config',
    'firebase.e2e.json',
    '--non-interactive',
    command,
  ],
  { env, stdio: 'inherit' },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
let interrupted = false;
child.on('exit', (code) => {
  process.exitCode = interrupted ? 130 : (code ?? 1);
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    interrupted = true;
    child.kill(signal);
  });
