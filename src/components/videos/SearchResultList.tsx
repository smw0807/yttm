'use client';

import { Button } from '@/components/ui/button';
import type { AddVideoSearchResult } from '@/hooks/useAddVideoDialog';

interface SearchResultListProps {
  results: AddVideoSearchResult[];
  addingId: string | null;
  onAdd: (result: AddVideoSearchResult) => void;
  labels: {
    loadingButton: string;
    addButton: string;
  };
}

export function SearchResultList({ results, addingId, onAdd, labels }: SearchResultListProps) {
  if (results.length === 0) return null;

  return (
    <ul className="-mx-1 flex max-h-72 flex-col gap-1 overflow-y-auto px-1">
      {results.map((result) => (
        <li key={result.youtubeId} className="hover:bg-muted flex items-center gap-3 rounded-md p-2">
          {/* YouTube thumbnail hosts vary by result, so keep a plain img here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.thumbnail}
            alt={result.title}
            className="h-14 w-24 shrink-0 rounded object-cover"
          />
          <span className="line-clamp-2 min-w-0 flex-1 text-sm">{result.title}</span>
          <Button
            size="sm"
            disabled={addingId === result.youtubeId}
            onClick={() => onAdd(result)}
            className="shrink-0"
          >
            {addingId === result.youtubeId ? labels.loadingButton : labels.addButton}
          </Button>
        </li>
      ))}
    </ul>
  );
}
