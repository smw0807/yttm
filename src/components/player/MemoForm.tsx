'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatTimestamp } from '@/lib/youtube';

interface Props {
  onSave: (timestampSec: number, content: string) => Promise<void>;
  getCurrentTime: () => number;
}

export function MemoForm({ onSave, getCurrentTime }: Props) {
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
        <span className="text-sm font-semibold">메모 추가</span>
        <Button size="sm" variant="outline" onClick={captureTime}>
          {timestamp !== null ? `⏱ ${formatTimestamp(timestamp)} 찍힘` : '현재 시각 찍기'}
        </Button>
      </div>
      <Textarea
        placeholder="메모 내용을 입력하세요"
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
        {saving ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}
