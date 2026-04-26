'use client';

import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchResultList } from '@/components/videos/SearchResultList';
import type { AddVideoSearchResult } from '@/hooks/useAddVideoDialog';

interface AddVideoSearchTabProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string | null;
  results: AddVideoSearchResult[];
  addingId: string | null;
  onAddResult: (result: AddVideoSearchResult) => void;
  labels: {
    searchPlaceholder: string;
    searching: string;
    searchButton: string;
    loadingButton: string;
    addButton: string;
  };
}

export function AddVideoSearchTab({
  query,
  onQueryChange,
  onSubmit,
  loading,
  error,
  results,
  addingId,
  onAddResult,
  labels,
}: AddVideoSearchTabProps) {
  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoFocus
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? labels.searching : labels.searchButton}
        </Button>
      </form>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <SearchResultList
        results={results}
        addingId={addingId}
        onAdd={onAddResult}
        labels={{ loadingButton: labels.loadingButton, addButton: labels.addButton }}
      />
    </div>
  );
}
