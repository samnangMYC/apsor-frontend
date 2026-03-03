function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-linear-to-r from-bg-subtle via-brand-soft/45 to-bg-surface ${className}`}
    />
  );
}

export default function ServiceDetailSkeleton() {
  return (
    <main
      className="flex-1 px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64"
      aria-busy="true"
      aria-live="polite"
    >
      <SkeletonBar className="mb-4 h-9 w-56 rounded-pill" />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <article className="rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4">
            <SkeletonBar className="h-52 w-full rounded-lg sm:h-64 md:h-[28rem]" />
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              <SkeletonBar className="h-24 rounded-lg sm:h-28" />
              <SkeletonBar className="h-24 rounded-lg sm:h-28" />
              <SkeletonBar className="h-24 rounded-lg sm:h-28" />
              <SkeletonBar className="h-24 rounded-lg sm:h-28" />
              <SkeletonBar className="h-24 rounded-lg sm:h-28" />
            </div>
          </article>

          <article className="rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4">
            <SkeletonBar className="mb-3 h-5 w-36" />
            <SkeletonBar className="h-56 w-full rounded-lg sm:h-64" />
            <SkeletonBar className="mt-2 h-4 w-3/4" />
          </article>

          <article className="rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
            <SkeletonBar className="h-6 w-3/5" />
            <SkeletonBar className="mt-3 h-4 w-full" />
            <SkeletonBar className="mt-2 h-4 w-[92%]" />
            <SkeletonBar className="mt-2 h-4 w-[85%]" />
            <SkeletonBar className="mt-2 h-4 w-[70%]" />
          </article>
        </div>

        <aside className="rounded-xl border border-border bg-bg-surface p-4 shadow-1 sm:p-5">
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="mt-2 h-6 w-3/4" />

          <div className="mt-4 space-y-2">
            <SkeletonBar className="h-16 w-full" />
            <SkeletonBar className="h-16 w-full" />
            <SkeletonBar className="h-16 w-full" />
          </div>

          <SkeletonBar className="mt-4 h-10 w-full" />
          <SkeletonBar className="mt-3 h-10 w-full" />

          <div className="mt-4 border-t border-border pt-4">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="mt-3 h-12 w-full" />
          </div>
        </aside>
      </section>
    </main>
  );
}
