'use client';

import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddVideoUrlTabProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string | null;
  labels: {
    urlPlaceholder: string;
    loadingButton: string;
    addButton: string;
  };
}

export function AddVideoUrlTab({
  url,
  onUrlChange,
  onSubmit,
  loading,
  error,
  labels,
}: AddVideoUrlTabProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        placeholder={labels.urlPlaceholder}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        autoFocus
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
      <Button type="submit" disabled={loading || !url.trim()}>
        {loading ? labels.loadingButton : labels.addButton}
      </Button>
    </form>
  );
}
