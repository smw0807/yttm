'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MemoEditForm } from '@/components/player/MemoEditForm';
import { MemoTimestamp } from '@/components/player/MemoTimestamp';
import { useMemoEditing } from '@/hooks/useMemoEditing';
import { cn } from '@/lib/utils';
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
  const {
    editingId,
    editValue,
    setEditValue,
    savingId,
    deleteTargetId,
    deletingId,
    error,
    startEdit,
    cancelEdit,
    requestDelete,
    saveEdit,
    confirmDelete,
    cancelDelete,
  } = useMemoEditing({
    videoId: video.id,
    defaultError: tc('error'),
    onAfterUpdate: (memoId, content) => {
      setMemos((prev) => prev.map((m) => (m.id === memoId ? { ...m, content } : m)));
    },
    onAfterDelete: (memoId) => {
      setMemos((prev) => prev.filter((m) => m.id !== memoId));
    },
  });

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
            <li
              key={memo.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-opacity',
                deletingId === memo.id && 'opacity-50',
              )}
            >
              <MemoTimestamp timestampSec={memo.timestampSec} />

              {editingId === memo.id ? (
                <MemoEditForm
                  value={editValue}
                  onChange={setEditValue}
                  onSave={() => saveEdit(memo.id)}
                  onCancel={cancelEdit}
                  saving={savingId === memo.id}
                  saveLabel={t('saveButton')}
                  savingLabel={t('saving')}
                  cancelLabel={t('cancelButton')}
                />
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
                    onClick={() => requestDelete(memo.id)}
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

      {error && <p className="text-destructive mt-3 text-sm">{error}</p>}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => router.push(`/videos/${video.id}`)}>{t('backToVideo')}</Button>
      </div>

      <ConfirmDialog
        open={!!deleteTargetId}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('deleteButton')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
