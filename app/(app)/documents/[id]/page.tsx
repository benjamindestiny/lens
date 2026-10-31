"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { generate, getLessons, getStatus, getTopics, saveTopics } from "@/lib/api";
import type { DocumentStatus, Lesson, Topic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, statusTone } from "@/components/ui/badge";

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
  const [generating, setGenerating] = useState(false);

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
    setGenerating(true);
    const selected = topics.filter((t) => t.selected).map((t) => t.id);
    try {
      await saveTopics(id, selected);
      await generate(id);
      setStatus("generating");
      const l = await getLessons(id);
      setLessons(l.lessons);
    } finally {
      setGenerating(false);
    }
  }

  const selectedCount = topics.filter((t) => t.selected).length;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-foreground">
        ← Back to documents
      </Link>

      {status === "failed" && (
        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-foreground">We couldn&apos;t process this document</h1>
          <p className="mt-2 text-base text-muted">{error ?? "Something went wrong."}</p>
          <div className="mt-6">
            <Link
              href="/upload"
              className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Try another file
            </Link>
          </div>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-foreground">Analysing your document…</h1>
          <p className="mt-2 text-base text-muted">
            Extracting the content and finding the topics inside it.
          </p>
          <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
          <p className="mt-3 text-sm text-muted">This usually takes less than a minute.</p>
        </div>
      )}

      {status === "topics_ready" && (
        <div className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Review the topics</h1>
              <p className="mt-2 text-base text-muted">
                We found {topics.length} {topics.length === 1 ? "topic" : "topics"} in your document. Uncheck anything you don&apos;t want a lesson for.
              </p>
            </div>
            <Badge tone="accent">
              {selectedCount} of {topics.length} selected
            </Badge>
          </div>

          <ul className="mt-8 space-y-3">
            {topics.map((t, i) => (
              <li key={t.id}>
                <Card
                  className={`cursor-pointer transition-colors ${
                    t.selected ? "border-accent/40" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <CardBody
                    className="flex items-start gap-4"
                    onClick={() => toggleTopic(t.id)}
                  >
                    <input
                      type="checkbox"
                      checked={t.selected}
                      onChange={() => toggleTopic(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted">{String(i + 1).padStart(2, "0")}</span>
                        <p className="text-base font-medium text-foreground">{t.title}</p>
                      </div>
                      {t.summary && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.summary}</p>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
            <span className="text-sm text-muted">
              {selectedCount === 0
                ? "Select at least one topic to continue"
                : `${selectedCount} ${selectedCount === 1 ? "lesson" : "lessons"} will be generated`}
            </span>
            <Button onClick={onGenerate} disabled={selectedCount === 0 || generating}>
              {generating ? "Starting…" : "Generate lessons"}
            </Button>
          </div>
        </div>
      )}

      {(status === "generating" || status === "ready") && lessons.length === 0 && (
        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-foreground">Generating your lessons…</h1>
          <p className="mt-2 text-base text-muted">
            This can take a few minutes. You can leave this page and come back.
          </p>
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Your lessons</h1>
              <p className="mt-2 text-base text-muted">
                {lessons.length} {lessons.length === 1 ? "topic" : "topics"}, each with its own lesson.
              </p>
            </div>
            <Badge tone={statusTone(status)}>{status}</Badge>
          </div>

          <ul className="mt-8 space-y-3">
            {lessons.map((l, i) => (
              <li key={l.id}>
                <Card className="transition-colors hover:border-muted/40">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium text-foreground">{l.title}</p>
                        <p className="text-sm text-muted">
                          {l.duration_seconds ? `${Math.round(l.duration_seconds / 60)} min` : "Length pending"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/lessons/${l.id}`}
                      className="inline-flex shrink-0 items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
                    >
                      Watch
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
