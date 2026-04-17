import { useState, useEffect } from 'react';
import type { User, ExtMessage } from '../../types';

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    // 초기 상태 요청
    chrome.runtime.sendMessage<ExtMessage>({ type: 'GET_CURRENT_VIDEO' }, (res) => {
      // GET_CURRENT_VIDEO 응답에 user 포함됨
      if (res?.user !== undefined) setUser(res.user);
    });

    // 이후 변경 구독
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
  };

  return { user, signIn, signOut };
}
