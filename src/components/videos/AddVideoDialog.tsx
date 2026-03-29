'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addVideo } from '@/lib/firebase/firestore';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

export function AddVideoDialog({ open, onClose, onAdded, userId }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '영상 정보를 가져오지 못했습니다');

      await addVideo({ ...data, userId, shareToken: null });
      setUrl('');
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      setUrl('');
      setError('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>YouTube 영상 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="https://youtu.be/... 또는 https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" disabled={loading || !url.trim()}>
            {loading ? '불러오는 중...' : '추가'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
