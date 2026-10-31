import type { SupabaseClient } from "@supabase/supabase-js";
import { extractTextFromFile } from "./extract-text";
import { detectTopics } from "./detect-topics";

export async function createDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File
) {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage
    .from("lectures")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id: userId, filename: file.name, status: "processing", storage_path: path })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Could not create document: ${error?.message}`);
  return data.id as string;
}

export async function processDocument(
  supabase: SupabaseClient,
  documentId: string,
  buffer: ArrayBuffer,
  filename: string
) {
  try {
    const text = await extractTextFromFile(buffer, filename);
    if (!text || text.trim().length < 50) {
      throw new Error("Extracted text was too short to analyse.");
    }
    const detected = await detectTopics(text);

    const rows = detected.map((t, i) => ({
      document_id: documentId,
      title: t.title,
      summary: t.summary,
      order: i + 1,
      selected: true,
    }));
    const { error: tErr } = await supabase.from("topics").insert(rows);
    if (tErr) throw new Error(`Could not save topics: ${tErr.message}`);

    await supabase
      .from("documents")
      .update({ status: "topics_ready" })
      .eq("id", documentId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Processing failed";
    await supabase
      .from("documents")
      .update({ status: "failed", error: msg })
      .eq("id", documentId);
  }
}
