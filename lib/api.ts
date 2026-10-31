import type { ApiError, DocumentStatus, Lesson, Topic } from "./types";

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err?.error?.message ?? "Request failed");
  }
  return data as T;
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/documents", { method: "POST", body: form });
  return json<{ document_id: string; status: DocumentStatus; filename: string }>(res);
}

export async function listDocuments() {
  const res = await fetch("/api/documents");
  return json<{ documents: { id: string; filename: string; status: DocumentStatus; created_at: string }[] }>(res);
}

export async function getStatus(id: string) {
  const res = await fetch(`/api/documents/${id}/status`);
  return json<{ document_id: string; status: DocumentStatus; progress: number; message: string | null; error: { code: string; message: string } | null }>(res);
}

export async function getTopics(id: string) {
  const res = await fetch(`/api/documents/${id}/topics`);
  return json<{ document_id: string; topics: Topic[] }>(res);
}

export async function saveTopics(id: string, topicIds: string[]) {
  const res = await fetch(`/api/documents/${id}/topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic_ids: topicIds }),
  });
  return json<{ document_id: string; status: DocumentStatus; selected_count: number }>(res);
}

export async function generate(id: string) {
  const res = await fetch(`/api/documents/${id}/generate`, { method: "POST" });
  return json<{ document_id: string; status: DocumentStatus }>(res);
}

export async function getLessons(id: string) {
  const res = await fetch(`/api/documents/${id}/lessons`);
  return json<{ document_id: string; lessons: Lesson[] }>(res);
}

export async function getLesson(id: string) {
  const res = await fetch(`/api/lessons/${id}`);
  return json<{ id: string; title: string; video_url: string | null; duration_seconds: number | null; document_id: string; topic_id: string }>(res);
}
