# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start development server (http://localhost:3000)
yarn build        # Production build
yarn start        # Run production build
yarn lint         # ESLint check
yarn format       # Prettier write
yarn format:check # Prettier check (CI)
```

No test framework is configured.

## Architecture

YouTube Timeline Memo — Next.js 16.2 App Router + Firebase, no separate backend.

**Auth flow:** Firebase client `signIn*` → `getIdToken` → `POST /api/auth/session` → httpOnly `__session` cookie → server components verify via `getSessionUser()` (React `cache`-wrapped `adminAuth.verifySessionCookie`).

- `src/lib/firebase/admin.ts` — Firebase Admin SDK init + `getSessionUser()` + `isAdmin()`
- `src/lib/firebase/config.ts` — Client SDK init (`app`, `db` only — no `getAuth` to avoid SSR errors)
- `src/lib/firebase/auth.ts` — Client-only (`"use client"`) Google/anonymous sign-in helpers
- `src/lib/firebase/firestore.ts` — Client CRUD helpers
- `src/lib/firebase/admin-firestore.ts` — Server-only Firestore queries

**Route structure:** All pages live under `src/app/[locale]/` (locales: `ko`, `en`; default: `ko`). Auth-guarded pages live inside `(protected)/` — `layout.tsx` calls `getSessionUser()` and redirects to `/{locale}/login` if null. API routes at `src/app/api/` have no locale prefix.

**i18n:** `next-intl` v4.9 via `src/proxy.ts` (Next.js 16.2 middleware convention). Client navigation uses `useRouter`/`Link`/`usePathname` from `@/i18n/navigation`. Server redirects use `redirect` from `next/navigation` + `getLocale()` from `next-intl/server`.

**UI:** shadcn/ui built on `@base-ui/react` (not Radix) — no `asChild` prop on `Button`. Tailwind CSS v4. `buttonVariants` is `"use client"` — use inline Tailwind in Server Components instead.

**Page pattern:** async Server Component fetches data → passes to Client Component for interactivity. After mutations, call `router.refresh()` to re-fetch server data.

## Key Pitfalls

- `FIREBASE_ADMIN_SDK` env var must be base64-encoded service account JSON.
- `ADMIN_UIDS` is a comma-separated list of Firebase UIDs that grants admin access.
- `src/proxy.ts` is the middleware file (not `middleware.ts`) — Next.js 16.2 convention.
- Firestore memos are a subcollection: `videos/{videoId}/memos/{memoId}`.
- `createNavigation`'s server `redirect` requires `{ href, locale }` object; use `next/navigation`'s `redirect` with a locale-prefixed string instead.
