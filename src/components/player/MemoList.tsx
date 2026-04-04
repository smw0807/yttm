'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimestamp } from '@/lib/youtube';
import { deleteMemo, updateMemo } from '@/lib/firebase/firestore';
import type { Memo } from '@/types';

interface Props {
  videoId: string;
  memos: Memo[];
  onSeek: (seconds: number) => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function MemoList({ videoId, memos, onSeek, onDeleted, onUpdated }: Props) {
  const t = useTranslations('memoList');
  const tc = useTranslations('common');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(memoId: string) {
    setDeletingId(memoId);
    setError(null);
    try {
      await deleteMemo(videoId, memoId);
      onDeleted();
    } catch {
      setError(tc('error'));
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(memo: Memo & { id?: string }) {
    setEditingId(memo.id!);
    setEditValue(memo.content);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function handleSaveEdit(memoId: string) {
    if (!editValue.trim()) return;
    setSavingId(memoId);
    setError(null);
    try {
      await updateMemo(videoId, memoId, editValue.trim());
      onUpdated();
      setEditingId(null);
      setEditValue('');
    } catch {
      setError(tc('error'));
    } finally {
      setSavingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return memos;
    return memos.filter((m) => m.content.toLowerCase().includes(q));
  }, [memos, query]);

  if (memos.length === 0) {
    return (
      <p className="text-muted-foreground whitespace-pre-line py-10 text-center text-sm">
        {t('noMemos')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-8 text-sm"
      />

      {error && <p className="text-destructive text-xs">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">{t('noSearchResults')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((memo) => (
            <li
              key={memo.id}
              className="group hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
            >
              <button
                onClick={() => onSeek(memo.timestampSec)}
                aria-label={t('seekToTime', { time: formatTimestamp(memo.timestampSec) })}
                className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700 hover:bg-red-200"
              >
                {formatTimestamp(memo.timestampSec)}
              </button>

              {editingId === memo.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(memo.id!);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="h-7 text-sm"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleSaveEdit(memo.id!)}
                      disabled={savingId === memo.id || !editValue.trim()}
                    >
                      {savingId === memo.id ? tc('saving') : tc('save')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={cancelEdit}
                    >
                      {tc('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="flex-1 cursor-pointer text-left text-sm leading-relaxed"
                  onClick={() => onSeek(memo.timestampSec)}
                >
                  {memo.content}
                </button>
              )}

              {editingId !== memo.id && (
                <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(memo)}
                    disabled={deletingId === memo.id}
                    aria-label={t('editMemo')}
                  >
                    ✎
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(memo.id!)}
                    disabled={deletingId === memo.id}
                    aria-label={t('deleteMemo')}
                  >
                    {deletingId === memo.id ? (
                      <span className="border-muted-foreground h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                    ) : (
                      '✕'
                    )}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
