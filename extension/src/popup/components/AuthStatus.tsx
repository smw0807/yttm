import React from 'react';
import type { User } from '../../types';

interface Props {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  authError?: string | null;
  signingIn?: boolean;
}

export function AuthStatus({
  user,
  onSignIn,
  onSignOut,
  authError = null,
  signingIn = false,
}: Props) {
  if (!user) {
    return (
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">로그인이 필요합니다</span>
          <button
            onClick={onSignIn}
            disabled={signingIn}
            className="rounded bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingIn ? '로그인 중...' : 'Google 로그인'}
          </button>
        </div>
        {authError && (
          <p className="mt-2 break-words text-[11px] leading-relaxed text-red-500">
            로그인 실패: {authError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center gap-2">
        {user.photoURL && <img src={user.photoURL} alt="" className="h-5 w-5 rounded-full" />}
        <span className="max-w-[140px] truncate text-xs text-gray-700">
          {user.displayName ?? user.email ?? '사용자'}
        </span>
      </div>
      <button onClick={onSignOut} className="text-xs text-gray-400 hover:text-gray-600">
        로그아웃
      </button>
    </div>
  );
}
