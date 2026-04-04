'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addCollection } from '@/lib/firebase/firestore';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  onAdded: () => void;
}

export function AddCollectionDialog({ open, onClose, userId, onAdded }: Props) {
  const t = useTranslations('addCollectionDialog');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await addCollection({ name: name.trim(), description: description.trim(), videoIds: [], userId });
    setLoading(false);
    setName('');
    setDescription('');
    onAdded();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('nameLabel')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              maxLength={50}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{t('descLabel')}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descPlaceholder')}
              rows={3}
              maxLength={200}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('cancelButton')}
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {t('createButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
