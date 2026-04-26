'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { deleteCollection } from '@/lib/firebase/firestore';
import type { CollectionWithId } from '@/types';

export function useCollectionDialogs() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionWithId | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function closeDetail() {
    setSelectedCollection(null);
    refresh();
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    await deleteCollection(deleteTargetId);
    setDeleteTargetId(null);
    refresh();
  }

  return {
    addOpen,
    openAdd: () => setAddOpen(true),
    closeAdd: () => setAddOpen(false),
    selectedCollection,
    selectCollection: setSelectedCollection,
    closeDetail,
    deleteTargetId,
    requestDelete: setDeleteTargetId,
    cancelDelete: () => setDeleteTargetId(null),
    confirmDelete,
    refresh,
  };
}
