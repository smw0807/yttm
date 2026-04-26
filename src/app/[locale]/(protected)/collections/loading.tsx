import { CARD_GRID } from '@/lib/constants';

export default function CollectionsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-muted h-8 w-24 animate-pulse rounded" />
        <div className="bg-muted h-9 w-28 animate-pulse rounded" />
      </div>
      <div className="bg-muted mb-6 h-24 w-full animate-pulse rounded-lg" />
      <div className={CARD_GRID}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <div className="bg-muted aspect-video w-full animate-pulse" />
            <div className="p-3">
              <div className="bg-muted mb-1.5 h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
