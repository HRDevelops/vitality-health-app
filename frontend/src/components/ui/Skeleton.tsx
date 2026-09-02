export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-container-highest/70 ${className}`} data-testid="skeleton-block" />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-section-gap animate-fade-in" data-testid="dashboard-skeleton">
      <SkeletonBlock className="h-24 w-full rounded-[24px]" />
      <div className="grid grid-cols-2 gap-gutter">
        <SkeletonBlock className="aspect-square rounded-[24px]" />
        <SkeletonBlock className="aspect-square rounded-[24px]" />
        <SkeletonBlock className="aspect-square rounded-[24px]" />
        <SkeletonBlock className="aspect-square rounded-[24px]" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-fade-in" data-testid="list-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}
