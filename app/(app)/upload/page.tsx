"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UploadModal } from "@/components/upload-modal";

type ModalState = "idle" | "uploading" | "error" | "success";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>("idle");
  const [progress, setProgress] = useState(0);

  function pick(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    if (!/\.(pdf|pptx)$/i.test(f.name)) return setError("Only PDF and PowerPoint files are supported.");
    setFile(f);
  }

  async function doUpload() {
    if (!file) return;
    setModal("uploading");
    setProgress(0);

    const tick = setInterval(() => {
      setProgress((p) => (p < 0.9 ? p + 0.07 : p));
    }, 200);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("lectures")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(upErr.message);

      setProgress(0.95);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, storage_path: path }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not create document.");
      }

      const data = await res.json();
      clearInterval(tick);
      setProgress(1);
      setModal("success");
      setTimeout(() => router.push(`/documents/${data.document_id}`), 800);
    } catch (err) {
      clearInterval(tick);
      setError(err instanceof Error ? err.message : "Upload failed.");
      setModal("error");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    doUpload();
  }

  return (
    <div className="mx-auto max-w-xl">
      <UploadModal
        state={modal}
        progress={progress}
        filename={file?.name ?? ""}
        error={error}
        onRetry={() => { setModal("idle"); setError(null); }}
        onCancel={() => { setModal("idle"); setProgress(0); }}
      />

      <h1 className="text-3xl font-semibold text-foreground">Upload lecture material</h1>
      <p className="mt-2 text-base text-muted">
        A PDF or PowerPoint from your lecturer. We&apos;ll find the topics inside it and turn each one into a lesson.
      </p>

      <form onSubmit={onSubmit} className="mt-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft"
              : file ? "border-border bg-surface"
              : "border-border bg-surface hover:border-muted/60"
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.pptx" className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-xs font-semibold text-accent">
                {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-4 text-xs text-muted hover:text-danger">Remove</button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">Drop your file here, or click to browse</p>
              <p className="mt-1 text-xs text-muted">PDF or PPTX</p>
            </div>
          )}
        </div>

        {error && modal === "idle" && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Your file stays private to your account.</p>
          <Button type="submit" disabled={!file || modal === "uploading"}>
            {modal === "uploading" ? "Uploading…" : "Upload and analyse"}
          </Button>
        </div>
      </form>
    </div>
  );
}
