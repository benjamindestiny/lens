"use client";

type State = "idle" | "uploading" | "error" | "success";

export function UploadModal({
  state,
  progress,
  filename,
  error,
  onRetry,
  onCancel,
}: {
  state: State;
  progress: number;
  filename: string;
  error: string | null;
  onRetry: () => void;
  onCancel: () => void;
}) {
  if (state === "idle") return null;

  const pct = Math.floor(progress * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex justify-end p-2">
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6">
          {state === "uploading" && (
            <>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
              <h2 className="mt-4 text-center text-lg font-semibold text-foreground">
                Uploading your lecture
              </h2>
              <p className="mt-1 truncate text-center text-sm text-muted">{filename}</p>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Uploading</span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-150"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                onClick={onCancel}
                className="mt-6 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-danger">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </div>
              <h2 className="mt-4 text-center text-lg font-semibold text-foreground">
                Upload failed
              </h2>
              <p className="mt-1 text-center text-sm text-muted">
                {error ?? "Something went wrong. Try again."}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Retry
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success-soft">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="7 12.5 10 15.5 17 8.5" />
                </svg>
              </div>
              <h2 className="mt-4 text-center text-lg font-semibold text-foreground">
                Upload complete
              </h2>
              <p className="mt-1 text-center text-sm text-muted">
                Taking you to the topics we found…
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
