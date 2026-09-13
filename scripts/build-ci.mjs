// Compile with disposable credentials. Never deploy these build artifacts.
import { generateKeyPairSync } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  FIREBASE_ADMIN_SDK: Buffer.from(
    JSON.stringify({
      project_id: 'demo-yttm-ci',
      client_email: 'ci@demo-yttm-ci.iam.gserviceaccount.com',
      private_key: privateKey,
    }),
  ).toString('base64'),
  NEXT_PUBLIC_FIREBASE_API_KEY: 'ci-placeholder-not-a-real-api-key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-yttm-ci.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'demo-yttm-ci',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'demo-yttm-ci.appspot.com',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:1234567890:web:ci',
  NEXT_PUBLIC_BASE_URL: 'https://example.com',
  NEXT_PUBLIC_NAVER_SITE_VERIFICATION: '',
  NEXT_PUBLIC_ADFIT_UNIT: '',
  ADMIN_UID: '',
  YOUTUBE_API_KEY: '',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
};

const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  env,
  stdio: 'inherit',
});
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
