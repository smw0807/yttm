import React, { useState } from 'react';
import { formatTimestamp } from '../../lib/youtube';
import type { MemoWithId } from '../../types';
import type { ExtMessage } from '../../types';

interface Props {
  memo: MemoWithId;
  onUpdate: (memoId: string, content: string) => Promise<void>;
  onDelete: (memoId: string) => Promise<void>;
}

export function MemoItem({ memo, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);
  const [saving, setSaving] = useState(false);

  const handleSeek = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) {
        chrome.tabs.sendMessage<ExtMessage>(tab.id, {
          type: 'SEEK_TO',
          payload: { timestampSec: memo.timestampSec },
        });
      }
    });
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await onUpdate(memo.id, editContent.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group flex gap-2 rounded p-2 hover:bg-gray-50">
      <button
        onClick={handleSeek}
        className="flex-shrink-0 rounded bg-red-50 px-1.5 py-0.5 font-mono text-xs text-red-600 transition-colors hover:bg-red-100"
        title="해당 시점으로 이동"
      >
        {formatTimestamp(memo.timestampSec)}
      </button>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="flex-1 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        ) : (
          <p className="break-words text-xs text-gray-800">{memo.content}</p>
        )}
      </div>
      {!editing && (
        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => {
              setEditContent(memo.content);
              setEditing(true);
            }}
            className="p-0.5 text-gray-400 hover:text-gray-600"
            title="수정"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(memo.id)}
            className="p-0.5 text-gray-400 hover:text-red-500"
            title="삭제"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
