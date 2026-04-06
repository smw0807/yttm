'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFetcher } from '@/hooks/useFetcher';

async function apiAddVideo(video: {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}) {
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

interface SearchResult {
  youtubeId: string;
  title: string;
  thumbnail: string;
  durationSec: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

type Tab = 'url' | 'search';

export function AddVideoDialog({ open, onClose, onAdded }: Props) {
  const t = useTranslations('addVideoDialog');
  const [tab, setTab] = useState<Tab>('url');

  // URL tab
  const [url, setUrl] = useState('');
  const { loading: urlLoading, error: urlError, setError: setUrlError, execute: executeUrl } = useFetcher(t('defaultError'));

  // Search tab
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { loading: searchLoading, error: searchError, setError: setSearchError, execute: executeSearch } = useFetcher(t('defaultError'));

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    await executeUrl(async () => {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('defaultError'));
      await apiAddVideo(data);
      setUrl('');
      onAdded();
      onClose();
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchResults([]);
    await executeSearch(async () => {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('defaultError'));
      setSearchResults(data);
    });
  }

  async function handleAddResult(result: SearchResult) {
    setAddingId(result.youtubeId);
    try {
      await apiAddVideo(result);
      onAdded();
      onClose();
    } catch {
      setSearchError(t('defaultError'));
    } finally {
      setAddingId(null);
    }
  }

  useEffect(() => {
    if (open) {
      setTab('url');
      setUrl('');
      setUrlError(null);
      setQuery('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {(['url', 'search'] as Tab[]).map((t2) => (
            <button
              key={t2}
              type="button"
              onClick={() => setTab(t2)}
              className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t2
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(t2 === 'url' ? 'tabUrl' : 'tabSearch')}
            </button>
          ))}
        </div>

        {/* URL Tab */}
        {tab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
            <Input
              placeholder={t('urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
            {urlError && <p className="text-destructive text-xs">{urlError}</p>}
            <Button type="submit" disabled={urlLoading || !url.trim()}>
              {urlLoading ? t('loadingButton') : t('addButton')}
            </Button>
          </form>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <div className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={searchLoading || !query.trim()}>
                {searchLoading ? t('searching') : t('searchButton')}
              </Button>
            </form>
            {searchError && <p className="text-destructive text-xs">{searchError}</p>}
            {searchResults.length > 0 && (
              <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1">
                {searchResults.map((result) => (
                  <li
                    key={result.youtubeId}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted"
                  >
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-24 h-14 object-cover rounded shrink-0"
                    />
                    <span className="flex-1 text-sm line-clamp-2 min-w-0">{result.title}</span>
                    <Button
                      size="sm"
                      disabled={addingId === result.youtubeId}
                      onClick={() => handleAddResult(result)}
                      className="shrink-0"
                    >
                      {addingId === result.youtubeId ? t('loadingButton') : t('addButton')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
