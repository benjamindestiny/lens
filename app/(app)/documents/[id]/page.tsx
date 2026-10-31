"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { generate, getLessons, getStatus, getTopics, saveTopics } from "@/lib/api";
import type { DocumentStatus, Lesson, Topic } from "@/lib/types";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [status, setStatus] = useState<DocumentStatus>("uploaded");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const s = await getStatus(id);
        if (cancelled) return;
        setStatus(s.status);
        setError(s.error?.message ?? null);

        if (s.status === "topics_ready") {
          const t = await getTopics(id);
          if (!cancelled) setTopics(t.topics);
        }

        if (s.status === "generating" || s.status === "ready") {
          const l = await getLessons(id);
          if (!cancelled) setLessons(l.lessons);
        }

        if (s.status !== "ready" && s.status !== "failed") {
          timer = setTimeout(tick, 2000);
        }
      } catch {
        if (!cancelled) timer = setTimeout(tick, 4000);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  function toggleTopic(tid: string) {
    setTopics((ts) => ts.map((t) => (t.id === tid ? { ...t, selected: !t.selected } : t)));
  }

  async function onGenerate() {
    const selected = topics.filter((t) => t.selected).map((t) => t.id);
    await saveTopics(id, selected);
    await generate(id);
    setStatus("generating");
    const l = await getLessons(id);
    setLessons(l.lessons);
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted">← Back</Link>

      {status === "failed" && (
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">We couldn&apos;t process this document</h1>
          <p className="mt-2 text-sm text-muted">{error ?? "Something went wrong."}</p>
          <Link href="/upload" className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground">
            Try another file
          </Link>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">Analysing your document…</h1>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
          <p className="mt-3 text-sm text-muted">Extracting content and detecting topics.</p>
        </div>
      )}

      {status === "topics_ready" && (
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">Review the topics we found</h1>
          <p className="mt-2 text-sm text-muted">Uncheck anything you don&apos;t want a video for.</p>
          <ul className="mt-6 space-y-3">
            {topics.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <input type="checkbox" checked={t.selected} onChange={() => toggleTopic(t.id)} className="mt-1" />
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-muted">{t.summary}</p>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={onGenerate} disabled={!topics.some((t) => t.selected)}
            className="mt-6 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground disabled:opacity-40">
            Generate lessons
          </button>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">Your lessons</h1>
          <ul className="mt-6 space-y-3">
            {lessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="text-sm text-muted">{l.duration_seconds ? `${Math.round(l.duration_seconds/60)} min` : "—"}</p>
                </div>
                <Link href={`/lessons/${l.id}`}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                  Watch
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lessons.length === 0 && status === "generating" && (
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">Generating your lessons…</h1>
          <p className="mt-2 text-sm text-muted">This can take a few minutes. You can leave this page.</p>
        </div>
      )}
    </div>
  );
}
