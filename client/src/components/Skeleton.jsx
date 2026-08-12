import { cx } from '../utils/format.js';

export function Skeleton({ className }) {
  return <div className={cx('animate-pulse rounded-md bg-slate-200/80', className)} />;
}

export function JobCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="card space-y-3 p-5">
      <Skeleton className="h-4 w-1/2" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function GridSkeleton({ cols = 3, rows = 2, card = 'job' }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${cols > 2 ? 'lg:grid-cols-3' : ''}`}>
      {Array.from({ length: cols * rows }).map((_, i) =>
        card === 'job' ? <JobCardSkeleton key={i} /> : <CardSkeleton key={i} />,
      )}
    </div>
  );
}
