'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFetcher } from '@/hooks/useFetcher';

interface Props {
  open: boolean;
  onClose: () => void;
  videoId: string;
  token: string | null;
  onTokenChange: (token: string | null) => void;
}

export function ShareDialog({ open, onClose, videoId, token, onTokenChange }: Props) {
  const t = useTranslations('shareDialog');
  const { loading, error, execute } = useFetcher();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = token ? `${origin}/share/${token}` : null;

  async function updateShare(method: 'POST' | 'DELETE') {
    await execute(async () => {
      try {
        const res = await fetch('/api/share', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (method === 'POST') {
          if (typeof data?.token !== 'string' || !data.token.trim()) throw new Error();
          onTokenChange(data.token);
        } else {
          if (data?.success !== true) throw new Error();
          onTokenChange(null);
        }
        setCopied(false);
      } catch {
        throw new Error(t('updateError'));
      }
    });
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
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {shareUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1 font-mono text-xs" />
              <Button onClick={handleCopy} variant="outline" className="shrink-0">
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t('shareInfo')}</p>
            <Button variant="destructive" onClick={() => updateShare('DELETE')} disabled={loading}>
              {t('revokeLink')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t('createInfo')}</p>
            <Button onClick={() => updateShare('POST')} disabled={loading}>
              {t('createLink')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
