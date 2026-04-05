'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addVideo } from '@/lib/firebase/firestore';
import { useFetcher } from '@/hooks/useFetcher';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

export function AddVideoDialog({ open, onClose, onAdded, userId }: Props) {
  const t = useTranslations('addVideoDialog');
  const [url, setUrl] = useState('');
  const { loading, error, setError, execute } = useFetcher(t('defaultError'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    await execute(async () => {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('defaultError'));
      await addVideo({ ...data, userId, shareToken: null });
      setUrl('');
      onAdded();
      onClose();
    });
  }

  useEffect(() => {
    if (open) {
      setUrl('');
      setError(null);
    }
  }, [open]); // setError is a stable setState reference

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder={t('urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" disabled={loading || !url.trim()}>
            {loading ? t('loadingButton') : t('addButton')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
