'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MemoEditFormProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function MemoEditForm({
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  saveLabel,
  savingLabel,
  cancelLabel,
  inputClassName = 'text-sm',
  buttonClassName,
}: MemoEditFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
        autoFocus
        className={inputClassName}
      />
      <div className="flex gap-2">
        <Button size="sm" className={buttonClassName} onClick={onSave} disabled={saving || !value.trim()}>
          {saving ? savingLabel : saveLabel}
        </Button>
        <Button size="sm" variant="ghost" className={buttonClassName} onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
