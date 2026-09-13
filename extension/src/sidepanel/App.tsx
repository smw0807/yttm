import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useCurrentVideo } from './hooks/useCurrentVideo';
import { useMemos } from './hooks/useMemos';
import { AuthScreen } from './components/AuthScreen';
import { VideoHeader } from './components/VideoHeader';
import { MemoForm } from './components/MemoForm';
import { MemoList } from './components/MemoList';

export function App() {
  const { user, signIn, signOut, authError, signingIn } = useAuth();
  const { videoInfo, refreshVideo } = useCurrentVideo();
  const { memos, loading, add, update, remove } = useMemos(videoInfo, user ?? null);

  // 로딩 중
  if (user === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        로딩 중...
      </div>
    );
  }

  // 미로그인
  if (!user) {
    return <AuthScreen onSignIn={signIn} authError={authError} signingIn={signingIn} />;
  }

  // YouTube watch 페이지가 아님
  if (!videoInfo) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-3xl">▶️</span>
        <div>
          <p className="text-sm font-medium text-gray-700">YouTube 영상을 재생하세요</p>
          <p className="mt-1 text-xs text-gray-400">
            youtube.com/watch 페이지에서 메모를 사용할 수 있습니다
          </p>
        </div>
        <button
          onClick={() => void refreshVideo()}
          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          영상 정보 새로고침
        </button>
        <button onClick={signOut} className="text-xs text-gray-400 underline hover:text-gray-600">
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 헤더: 영상 정보 + 로그아웃 */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2">
          <a
            href="https://www.yttm.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-700 transition-colors hover:text-red-600"
          >
            YouTube Timeline Memo
          </a>
          <div className="flex items-center gap-2">
            {user.photoURL && <img src={user.photoURL} alt="" className="h-5 w-5 rounded-full" />}
            <button onClick={signOut} className="text-xs text-gray-400 hover:text-gray-600">
              로그아웃
            </button>
          </div>
        </div>
        <VideoHeader videoInfo={videoInfo} />
        <MemoForm onSubmit={add} />
      </div>

      {/* 메모 목록 */}
      <MemoList memos={memos} loading={loading} onUpdate={update} onDelete={remove} />
    </div>
  );
}
