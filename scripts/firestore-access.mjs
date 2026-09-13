// Local-only, read-only production probe. No Admin SDK or credential export.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, loadEnv } from 'vite';
import { publicConfig } from './firestore-access/config.mjs';

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--project') {
  throw new Error('Usage: yarn verify:firestore:live --project yttm-38af5');
}
const root = fileURLToPath(new URL('./firestore-access/', import.meta.url));
const config = publicConfig(
  loadEnv('development', process.cwd(), 'NEXT_PUBLIC_FIREBASE_'),
  args[1],
);
const bundle = await build({
  root,
  configFile: false,
  envFile: false,
  publicDir: false,
  logLevel: 'error',
  define: { __FIREBASE_CONFIG__: JSON.stringify(config) },
  build: {
    write: false,
    rollupOptions: {
      input: `${root}client.ts`,
      output: { inlineDynamicImports: true },
    },
  },
});
if (Array.isArray(bundle) || !('output' in bundle)) throw new Error('Unexpected build output');
const chunks = bundle.output.filter((entry) => entry.type === 'chunk');
if (chunks.length !== 1) throw new Error('Expected one self-contained client bundle');
const html = await readFile(`${root}index.html`);
const port = 4318;
const server = createServer((request, response) => {
  if (!['localhost:4318', '127.0.0.1:4318'].includes(request.headers.host ?? '')) {
    response.writeHead(403).end();
    return;
  }
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  if (request.method !== 'GET') {
    response.writeHead(405).end();
  } else if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
  } else if (request.url === '/probe.js') {
    response.writeHead(200, { 'Content-Type': 'application/javascript' }).end(chunks[0].code);
  } else {
    response.writeHead(404).end();
  }
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Read-only Firestore probe (${config.projectId}): http://localhost:${port}`);
  console.log(
    'Use existing Google accounts only. Close the tab and stop this process after testing.',
  );
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
