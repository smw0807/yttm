'use client';

import { useState } from 'react';

export function useFetcher(defaultError?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function execute(fn: () => Promise<void>): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : (defaultError ?? 'An error occurred'));
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, execute };
}
