'use client';

import { Input } from '@/components/ui/input';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchField({ value, onChange, placeholder, className }: SearchFieldProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}
