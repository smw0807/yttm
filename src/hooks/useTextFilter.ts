'use client';

import { useMemo, useState } from 'react';

export function useTextFilter<T>(items: T[], getText: (item: T) => string) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => getText(item).toLowerCase().includes(normalizedQuery));
  }, [getText, items, query]);

  return { query, setQuery, filtered };
}
