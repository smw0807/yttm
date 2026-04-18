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
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
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
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <span className="text-3xl">▶️</span>
        <div>
          <p className="text-sm font-medium text-gray-700">YouTube 영상을 재생하세요</p>
          <p className="text-xs text-gray-400 mt-1">
            youtube.com/watch 페이지에서 메모를 사용할 수 있습니다
          </p>
        </div>
        <button
          onClick={() => void refreshVideo()}
          className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          영상 정보 새로고침
        </button>
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더: 영상 정보 + 로그아웃 */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
          <a
            href="https://www.yttm.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors"
          >
            YouTube Timeline Memo
          </a>
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
            )}
            <button
              onClick={signOut}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
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
