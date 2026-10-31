export default function Loading() {
  return (
    <div className="mt-8">
      <div className="h-8 w-64 animate-pulse rounded bg-surface" />
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
      </div>
      <p className="mt-3 text-sm text-muted">Loading…</p>
    </div>
  );
}
