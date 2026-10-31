export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-surface" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
        <div className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
        <div className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
      </div>
    </div>
  );
}
