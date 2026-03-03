function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
    />
  );
}

export default function CategoryDetailSkeleton() {
  return (
    <main
      className="service-detail-enter px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64"
      aria-busy="true"
      aria-live="polite"
    >
      <SkeletonBar className="mb-4 h-9 w-56 rounded-pill" />

      <section className="rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4">
        <SkeletonBar className="h-48 w-full rounded-lg sm:h-56 md:h-64" />
        <div className="mt-4 space-y-2">
          <SkeletonBar className="h-3 w-32" />
          <SkeletonBar className="h-8 w-2/3" />
          <SkeletonBar className="h-4 w-3/4" />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <SkeletonBar className="h-3 w-28" />
            <SkeletonBar className="h-6 w-44" />
          </div>
          <SkeletonBar className="hidden h-9 w-28 rounded-pill sm:block" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-lg border border-border bg-bg-surface p-4 shadow-1">
            <SkeletonBar className="h-5 w-3/4" />
            <SkeletonBar className="mt-2 h-4 w-full" />
            <SkeletonBar className="mt-1.5 h-4 w-[90%]" />
            <SkeletonBar className="mt-3 h-6 w-24 rounded-pill" />
          </article>
          <article className="rounded-lg border border-border bg-bg-surface p-4 shadow-1">
            <SkeletonBar className="h-5 w-4/5" />
            <SkeletonBar className="mt-2 h-4 w-full" />
            <SkeletonBar className="mt-1.5 h-4 w-[88%]" />
            <SkeletonBar className="mt-3 h-6 w-24 rounded-pill" />
          </article>
          <article className="rounded-lg border border-border bg-bg-surface p-4 shadow-1">
            <SkeletonBar className="h-5 w-2/3" />
            <SkeletonBar className="mt-2 h-4 w-full" />
            <SkeletonBar className="mt-1.5 h-4 w-[84%]" />
            <SkeletonBar className="mt-3 h-6 w-24 rounded-pill" />
          </article>
        </div>

        <SkeletonBar className="mt-4 h-10 w-full rounded-pill sm:hidden" />
      </section>
    </main>
  );
}
