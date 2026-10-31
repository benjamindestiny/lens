export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "topics_ready"
  | "generating"
  | "ready"
  | "failed";

export type Topic = {
  id: string;
  title: string;
  summary: string;
  order: number;
  selected: boolean;
};

export type Lesson = {
  id: string;
  topic_id: string;
  title: string;
  status: "queued" | "generating" | "ready" | "failed";
  duration_seconds: number | null;
  video_url: string | null;
  error: string | null;
};

export type ApiError = {
  error: { code: string; message: string };
};
