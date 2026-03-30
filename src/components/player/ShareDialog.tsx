'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
  videoId: string;
  token: string | null;
  onTokenChange: (token: string | null) => void;
}

export function ShareDialog({ open, onClose, videoId, token, onTokenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = token ? `${origin}/share/${token}` : null;

  async function handleCreate() {
    setLoading(true);
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });
    const { token: newToken } = await res.json();
    onTokenChange(newToken);
    setLoading(false);
  }

  async function handleRevoke() {
    setLoading(true);
    await fetch('/api/share', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });
    onTokenChange(null);
    setLoading(false);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>공유 링크</DialogTitle>
        </DialogHeader>
        {shareUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1 font-mono text-xs" />
              <Button onClick={handleCopy} variant="outline" className="shrink-0">
                {copied ? '복사됨' : '복사'}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              링크를 가진 누구나 이 영상의 타임라인 메모를 볼 수 있습니다.
            </p>
            <Button variant="destructive" onClick={handleRevoke} disabled={loading}>
              링크 비활성화
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              공유 링크를 생성하면 누구나 이 영상의 타임라인 메모를 볼 수 있습니다.
            </p>
            <Button onClick={handleCreate} disabled={loading}>
              링크 생성
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
