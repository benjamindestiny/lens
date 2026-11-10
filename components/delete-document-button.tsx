"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function DeleteDocumentButton({
  documentId,
  filename,
}: {
  documentId: string;
  filename: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error?.message ?? "Could not delete.");
      setBusy(false);
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-muted/70 transition-colors hover:text-danger"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[16rem] truncate text-xs text-muted" title={filename}>
        Delete this?
      </span>
      <button
        ref={cancelRef}
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-40"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
