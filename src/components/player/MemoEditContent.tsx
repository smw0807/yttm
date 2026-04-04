'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatTimestamp } from '@/lib/youtube';
import { deleteMemo, updateMemo } from '@/lib/firebase/firestore';
import type { Video, Memo } from '@/types';

interface Props {
  video: Video & { id: string };
  memos: (Memo & { id: string })[];
}

export function MemoEditContent({ video, memos: initialMemos }: Props) {
  const router = useRouter();
  const t = useTranslations('memoEdit');
  const tc = useTranslations('common');
  const [memos, setMemos] = useState(initialMemos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startEdit(memo: Memo & { id: string }) {
    setEditingId(memo.id);
    setEditValue(memo.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function handleSave(memoId: string) {
    if (!editValue.trim()) return;
    setSavingId(memoId);
    await updateMemo(video.id, memoId, editValue.trim());
    setMemos((prev) =>
      prev.map((m) => (m.id === memoId ? { ...m, content: editValue.trim() } : m)),
    );
    setEditingId(null);
    setEditValue('');
    setSavingId(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    setDeletingId(deleteTargetId);
    setDeleteTargetId(null);
    await deleteMemo(video.id, deleteTargetId);
    setMemos((prev) => prev.filter((m) => m.id !== deleteTargetId));
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/videos/${video.id}`}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {tc('back')}
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{video.title}</h1>
          <p className="text-muted-foreground text-xs">{t('subtitle', { count: memos.length })}</p>
        </div>
      </div>

      {memos.length === 0 ? (
        <p className="text-muted-foreground py-20 text-center">{t('noMemos')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {memos.map((memo) => (
            <li key={memo.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${deletingId === memo.id ? 'opacity-50' : ''}`}>
              <span className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700">
                {formatTimestamp(memo.timestampSec)}
              </span>

              {editingId === memo.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(memo.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(memo.id)}
                      disabled={savingId === memo.id || !editValue.trim()}
                    >
                      {savingId === memo.id ? t('saving') : t('saveButton')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      {t('cancelButton')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="flex-1 text-sm leading-relaxed">{memo.content}</p>
              )}

              {editingId !== memo.id && (
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(memo)} disabled={deletingId === memo.id}>
                    {t('editButton')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTargetId(memo.id)}
                    disabled={deletingId === memo.id}
                  >
                    {deletingId === memo.id ? t('deleting') : t('deleteButton')}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => router.push(`/videos/${video.id}`)}>{t('backToVideo')}</Button>
      </div>

      <ConfirmDialog
        open={!!deleteTargetId}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('deleteButton')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
