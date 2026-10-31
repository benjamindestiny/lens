"use client";
import { use, useEffect, useState } from "react";
import { getLesson } from "@/lib/api";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<{ title: string; video_url: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLesson(id).then(setLesson).catch((e) => setError(e.message));
  }, [id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{lesson?.title ?? "Lesson"}</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-surface">
        {lesson?.video_url ? (
          <video src={lesson.video_url} controls className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Video not ready</div>
        )}
      </div>
    </div>
  );
}
