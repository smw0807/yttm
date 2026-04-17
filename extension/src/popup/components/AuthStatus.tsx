import React from 'react';
import type { User } from '../../types';

interface Props {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthStatus({ user, onSignIn, onSignOut }: Props) {
  if (!user) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs text-gray-500">로그인이 필요합니다</span>
        <button
          onClick={onSignIn}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Google 로그인
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2">
        {user.photoURL && (
          <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
        )}
        <span className="text-xs text-gray-700 truncate max-w-[140px]">
          {user.displayName ?? user.email ?? '사용자'}
        </span>
      </div>
      <button
        onClick={onSignOut}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        로그아웃
      </button>
    </div>
  );
}
