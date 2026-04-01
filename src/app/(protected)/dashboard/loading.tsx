export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-muted h-8 w-24 animate-pulse rounded" />
        <div className="bg-muted h-9 w-24 animate-pulse rounded" />
      </div>

      {/* 영상 섹션 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-muted h-6 w-20 animate-pulse rounded" />
          <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 컬렉션 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="bg-muted h-6 w-20 animate-pulse rounded" />
          <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-muted aspect-video w-full animate-pulse" />
      <div className="p-3">
        <div className="bg-muted mb-1.5 h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
      </div>
    </div>
  );
}
