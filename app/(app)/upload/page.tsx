"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!/\.(pdf|pptx)$/i.test(f.name)) {
      setError("Only PDF and PowerPoint files are supported.");
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await uploadDocument(file);
      router.push(`/documents/${res.document_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setBusy(false);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Upload lecture material</h1>
        <p className="mt-2 text-base text-muted">
          A PDF or PowerPoint from your lecturer. We&apos;ll find the topics inside it and turn each one into a lesson.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging
              ? "border-accent bg-accent-soft"
              : file
              ? "border-border bg-surface"
              : "border-border bg-surface hover:border-muted/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.pptx"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent">
                {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-4 text-xs text-muted transition-colors hover:text-danger"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                Drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted">PDF or PPTX, up to your plan&apos;s file limit</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            Your file stays private to your account.
          </p>
          <Button type="submit" disabled={!file || busy}>
            {busy ? "Uploading…" : "Upload and analyse"}
          </Button>
        </div>
      </form>

      <Card className="mt-10">
        <CardBody>
          <p className="text-sm font-medium text-foreground">What happens next</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-foreground">1.</span>
              We read the document and find the topics inside it.
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">2.</span>
              You see the topics and choose which ones to keep.
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">3.</span>
              Each topic becomes a short lesson in your dashboard.
            </li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
