"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadDocument } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a PDF or PowerPoint file.");
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

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">Upload lecture material</h1>
      <p className="mt-2 text-sm text-muted">PDF or PowerPoint. We'll detect the topics and turn each one into a lesson.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block cursor-pointer rounded-xl border border-dashed border-border p-10 text-center hover:bg-surface">
          <input type="file" accept=".pdf,.pptx" className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }} />
          <span className="text-sm text-muted">{file ? file.name : "Click to choose a file"}</span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40">
          {busy ? "Uploading…" : "Upload and analyse"}
        </button>
      </form>
    </div>
  );
}
