import { CARD_GRID } from '@/lib/constants';

export default function VideosLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-6 h-9 w-64 animate-pulse rounded bg-muted" />
      <div className={CARD_GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="p-3">
              <div className="mb-1.5 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
