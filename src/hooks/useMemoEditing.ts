'use client';

import { useState } from 'react';
import { deleteMemo, updateMemo } from '@/lib/firebase/firestore';
import type { Memo } from '@/types';

type EditableMemo = Memo & { id?: string };

interface UseMemoEditingOptions {
  videoId: string;
  defaultError?: string;
  onAfterUpdate?: (memoId: string, content: string) => void | Promise<void>;
  onAfterDelete?: (memoId: string) => void | Promise<void>;
}

export function useMemoEditing({
  videoId,
  defaultError,
  onAfterUpdate,
  onAfterDelete,
}: UseMemoEditingOptions) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEdit(memo: EditableMemo) {
    if (!memo.id) return;
    setEditingId(memo.id);
    setEditValue(memo.content);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function requestDelete(memoId: string) {
    setDeleteTargetId(memoId);
  }

  async function saveEdit(memoId: string) {
    const content = editValue.trim();
    if (!content) return;

    setSavingId(memoId);
    setError(null);
    try {
      await updateMemo(videoId, memoId, content);
      await onAfterUpdate?.(memoId, content);
      cancelEdit();
    } catch {
      setError(defaultError ?? null);
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;

    const memoId = deleteTargetId;
    setDeletingId(memoId);
    setDeleteTargetId(null);
    setError(null);
    try {
      await deleteMemo(videoId, memoId);
      await onAfterDelete?.(memoId);
    } catch {
      setError(defaultError ?? null);
    } finally {
      setDeletingId(null);
    }
  }

  return {
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
    cancelDelete: () => setDeleteTargetId(null),
  };
}
