export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-linear-to-r from-[#f1f1f1] via-[#e5e5e5] to-[#f1f1f1] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite] ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="mt-4 pt-4 border-t border-[#f1f1f1]">
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  className = "grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} role="status" aria-label="Chargement en cours">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Chargement en cours…</span>
    </div>
  );
}

export function SkeletonHeading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-2/3" />
    </div>
  );
}