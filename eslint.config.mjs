import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals.map((config) => ({ ...config, files: ['src/**/*.{ts,tsx}', 'next.config.ts'] })),
  ...nextTs,
  {
    files: ['extension/**/*.{ts,tsx}'],
    settings: { react: { version: 'detect' } },
    plugins: nextVitals.find((config) => config.name === 'next').plugins,
    rules: Object.fromEntries(
      Object.entries(nextVitals.find((config) => config.name === 'next').rules).filter(
        ([name]) => !name.startsWith('@next/next/'),
      ),
    ),
  },
  prettier, // Prettier와 충돌하는 ESLint 규칙 비활성화
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '**/node_modules/**',
    'extension/dist/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
