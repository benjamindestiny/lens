"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getLesson } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Lesson = {
  id: string;
  title: string;
  video_url: string | null;
  duration_seconds: number | null;
  document_id: string;
  topic_id: string;
};

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLesson(id)
      .then(setLesson)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load lesson."));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={lesson ? `/documents/${lesson.document_id}` : "/dashboard"}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to lessons
      </Link>

      {error && (
        <div className="mt-8 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {lesson?.title ?? "Lesson"}
          </h1>
          {lesson?.duration_seconds ? (
            <Badge tone="neutral">{Math.round(lesson.duration_seconds / 60)} min</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-black">
        <div className="aspect-video w-full">
          {lesson?.video_url ? (
            <video
              src={lesson.video_url}
              controls
              playsInline
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-surface text-sm text-muted">
              {lesson ? "Video not ready" : "Loading…"}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted">
          Generated from your lecture material.
        </p>
        <Link
          href={lesson ? `/documents/${lesson.document_id}` : "/dashboard"}
          className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          All lessons →
        </Link>
      </div>
    </div>
  );
}
