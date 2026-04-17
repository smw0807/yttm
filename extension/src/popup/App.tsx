import React, { useEffect, useState } from 'react';
import { AuthStatus } from './components/AuthStatus';
import { RecentVideoList } from './components/RecentVideoList';
import { OpenSidePanelButton } from './components/OpenSidePanelButton';
import type { User, ExtMessage } from '../types';

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    chrome.runtime.sendMessage<ExtMessage>({ type: 'GET_AUTH_STATE' }, (res) => {
      setUser(res?.user ?? null);
    });

    const listener = (message: ExtMessage) => {
      if (message.type === 'AUTH_STATE_CHANGED') {
        setUser(message.payload.user);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const signIn = () => {
    chrome.runtime.sendMessage<ExtMessage>({ type: 'SIGN_IN' });
  };

  const signOut = () => {
    chrome.runtime.sendMessage<ExtMessage>({ type: 'SIGN_OUT' });
    setUser(null);
  };

  return (
    <div className="flex flex-col bg-white font-sans">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <img src="/icons/icon32.png" alt="logo" className="w-6 h-6" />
        <a
          href="https://www.yttm.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
        >
          YouTube Timeline Memo
        </a>
      </div>

      {user === undefined ? (
        <div className="px-4 py-3 text-xs text-gray-400">로딩 중...</div>
      ) : (
        <>
          <AuthStatus user={user} onSignIn={signIn} onSignOut={signOut} />
          {user && <RecentVideoList user={user} />}
          <OpenSidePanelButton />
        </>
      )}
    </div>
  );
}
