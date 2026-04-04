'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTimestamp } from '@/lib/youtube';

interface Props {
  onSave: (timestampSec: number, content: string) => Promise<void>;
  getCurrentTime: () => number;
}

export function MemoForm({ onSave, getCurrentTime }: Props) {
  const t = useTranslations('memoForm');
  const [content, setContent] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function captureTime() {
    setTimestamp(getCurrentTime());
  }

  async function handleSave() {
    if (timestamp === null || !content.trim()) return;
    setSaving(true);
    try {
      await onSave(timestamp, content.trim());
      setContent('');
      setTimestamp(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{t('title')}</span>
        <Button size="sm" variant="outline" onClick={captureTime}>
          {timestamp !== null ? t('captured', { time: formatTimestamp(timestamp) }) : t('captureTime')}
        </Button>
      </div>
      <Textarea
        placeholder={t('placeholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <Button
        size="sm"
        onClick={handleSave}
        disabled={timestamp === null || !content.trim() || saving}
      >
        {saving ? t('saving') : t('saveButton')}
      </Button>
    </div>
  );
}
