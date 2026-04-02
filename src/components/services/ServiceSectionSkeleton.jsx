function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
    />
  );
}

function ServiceCardSkeleton() {
  return (
    <article className="w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-bg-surface shadow-1 sm:w-[280px] lg:w-[300px]">
      <SkeletonBar className="h-40 w-full" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-4 w-4/5" />
            <SkeletonBar className="mt-2 h-3 w-2/3" />
          </div>
          <SkeletonBar className="h-6 w-16 rounded-pill" />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="mt-2 h-5 w-24" />
          </div>
          <SkeletonBar className="h-6 w-20 rounded-pill" />
        </div>

        <SkeletonBar className="mt-4 h-7 w-36 rounded-md" />
      </div>
    </article>
  );
}

export default function ServiceSectionSkeleton() {
  return (
    <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="mt-2 h-6 w-48" />
          <SkeletonBar className="mt-2 h-4 w-full max-w-md" />
        </div>

        <SkeletonBar className="hidden h-10 w-24 rounded-pill sm:block" />
      </div>

      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <ServiceCardSkeleton key={`service-section-skeleton-${index}`} />
        ))}
      </div>

      <SkeletonBar className="mt-3 h-11 w-full rounded-pill sm:hidden" />
    </section>
  );
}
