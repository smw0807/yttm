import React, { useState, useEffect } from 'react';
import { formatTimestamp } from '../../lib/youtube';
import type { ExtMessage } from '../../types';

interface Props {
  onSubmit: (timestampSec: number, content: string) => Promise<void>;
}

export function MemoForm({ onSubmit }: Props) {
  const [timestampSec, setTimestampSec] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Background에서 캡처된 타임스탬프 수신
  useEffect(() => {
    const listener = (message: ExtMessage) => {
      if (message.type === 'TIMESTAMP_READY') {
        setTimestampSec(message.payload.timestampSec);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(timestampSec, content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
              if (tab?.id) {
                chrome.tabs.sendMessage(
                  tab.id,
                  { type: 'GET_CURRENT_TIME' },
                  (res: { timestampSec: number } | undefined) => {
                    if (res?.timestampSec !== undefined) {
                      setTimestampSec(res.timestampSec);
                    }
                  },
                );
              }
            });
          }}
          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
        >
          <span>⏱</span>
          <span>현재 시간</span>
        </button>
        <input
          type="text"
          value={formatTimestamp(timestampSec)}
          onChange={(e) => {
            // MM:SS 또는 H:MM:SS 파싱
            const parts = e.target.value.split(':').map(Number);
            let sec = 0;
            if (parts.length === 2) sec = parts[0] * 60 + parts[1];
            else if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
            if (!isNaN(sec)) setTimestampSec(sec);
          }}
          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
          placeholder="0:00"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메모 내용..."
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : '저장'}
        </button>
      </div>
    </form>
  );
}
