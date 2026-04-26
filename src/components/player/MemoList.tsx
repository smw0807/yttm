'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MemoItem } from '@/components/player/MemoItem';
import { MemoEditForm } from '@/components/player/MemoEditForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchField } from '@/components/ui/search-field';
import { formatTimestamp } from '@/lib/youtube';
import { useMemoEditing } from '@/hooks/useMemoEditing';
import { useTextFilter } from '@/hooks/useTextFilter';
import type { Memo } from '@/types';

interface Props {
  videoId: string;
  memos: Memo[];
  onSeek: (seconds: number) => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

function getMemoContent(memo: Memo) {
  return memo.content;
}

export function MemoList({ videoId, memos, onSeek, onDeleted, onUpdated }: Props) {
  const t = useTranslations('memoList');
  const tc = useTranslations('common');
  const tEdit = useTranslations('memoEdit');
  const { query, setQuery, filtered } = useTextFilter(memos, getMemoContent);
  const {
    deletingId,
    deleteTargetId,
    editingId,
    editValue,
    setEditValue,
    savingId,
    error,
    startEdit,
    cancelEdit,
    requestDelete,
    saveEdit,
    confirmDelete,
    cancelDelete,
  } = useMemoEditing({
    videoId,
    defaultError: tc('error'),
    onAfterDelete: onDeleted,
    onAfterUpdate: onUpdated,
  });

  if (memos.length === 0) {
    return (
      <p className="text-muted-foreground whitespace-pre-line py-10 text-center text-sm">
        {t('noMemos')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={setQuery}
        className="h-8 text-sm"
      />

      {error && <p className="text-destructive text-xs">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">{t('noSearchResults')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((memo) => (
            <MemoItem
              key={memo.id}
              timestampSec={memo.timestampSec}
              onSeek={onSeek}
              seekAriaLabel={t('seekToTime', { time: formatTimestamp(memo.timestampSec) })}
              actions={
                editingId !== memo.id ? (
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
                      onClick={() => requestDelete(memo.id!)}
                      disabled={deletingId === memo.id}
                      aria-label={t('deleteMemo')}
                    >
                      {deletingId === memo.id ? <LoadingSpinner size="sm" /> : '✕'}
                    </Button>
                  </div>
                ) : undefined
              }
            >
              {editingId === memo.id ? (
                <MemoEditForm
                  value={editValue}
                  onChange={setEditValue}
                  onSave={() => saveEdit(memo.id!)}
                  onCancel={cancelEdit}
                  saving={savingId === memo.id}
                  saveLabel={tc('save')}
                  savingLabel={tc('saving')}
                  cancelLabel={tc('cancel')}
                  inputClassName="h-7 text-sm"
                  buttonClassName="h-6 px-2 text-xs"
                />
              ) : (
                <button
                  className="flex-1 cursor-pointer text-left text-sm leading-relaxed"
                  onClick={() => onSeek(memo.timestampSec)}
                >
                  {memo.content}
                </button>
              )}
            </MemoItem>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!deleteTargetId}
        title={tEdit('confirmDeleteTitle')}
        description={tEdit('confirmDeleteDesc')}
        confirmLabel={tc('delete')}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
