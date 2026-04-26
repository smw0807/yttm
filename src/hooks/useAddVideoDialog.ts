'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useFetcher } from '@/hooks/useFetcher';
import type { YouTubeVideoInfo } from '@/types';

export type AddVideoTab = 'url' | 'search';
export type AddVideoSearchResult = Pick<
  YouTubeVideoInfo,
  'youtubeId' | 'title' | 'thumbnail' | 'durationSec'
>;

async function apiAddVideo(video: AddVideoSearchResult) {
  const res = await fetch('/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(video),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to add video');
  }
}

interface UseAddVideoDialogOptions {
  open: boolean;
  defaultError: string;
  onAdded: () => void;
  onClose: () => void;
}

export function useAddVideoDialog({
  open,
  defaultError,
  onAdded,
  onClose,
}: UseAddVideoDialogOptions) {
  const [tab, setTab] = useState<AddVideoTab>('url');
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddVideoSearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const {
    loading: urlLoading,
    error: urlError,
    setError: setUrlError,
    execute: executeUrl,
  } = useFetcher(defaultError);
  const {
    loading: searchLoading,
    error: searchError,
    setError: setSearchError,
    execute: executeSearch,
  } = useFetcher(defaultError);

  const reset = useCallback(() => {
    setTab('url');
    setUrl('');
    setUrlError(null);
    setQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, [setSearchError, setUrlError]);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  async function handleUrlSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    await executeUrl(async () => {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || defaultError);
      await apiAddVideo(data);
      setUrl('');
      onAdded();
      onClose();
    });
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchResults([]);
    await executeSearch(async () => {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || defaultError);
      setSearchResults(data);
    });
  }

  async function handleAddResult(result: AddVideoSearchResult) {
    setAddingId(result.youtubeId);
    try {
      await apiAddVideo(result);
      onAdded();
      onClose();
    } catch {
      setSearchError(defaultError);
    } finally {
      setAddingId(null);
    }
  }

  return {
    tab,
    setTab,
    url,
    setUrl,
    urlLoading,
    urlError,
    handleUrlSubmit,
    query,
    setQuery,
    searchLoading,
    searchError,
    searchResults,
    addingId,
    handleSearch,
    handleAddResult,
  };
}
