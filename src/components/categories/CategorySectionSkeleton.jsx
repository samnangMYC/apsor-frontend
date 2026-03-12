function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
    />
  );
}

export default function CategorySectionSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`category-skeleton-${index}`}
          className="w-42.5 shrink-0 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1 sm:w-46.25 lg:w-50"
        >
          <SkeletonBar className="h-28 w-full" />
          <div className="p-3">
            <SkeletonBar className="h-4 w-4/5" />
            <SkeletonBar className="mt-2 h-3 w-2/5 rounded-pill" />
          </div>
        </div>
      ))}
    </div>
  );
}
