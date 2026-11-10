import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/extract-text";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, status, created_at")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: { code: "DB_ERROR", message: error.message } }, { status: 500 });
  return Response.json({ documents: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });

  const body = await req.json().catch(() => null);
  const filename = body?.filename;
  const storagePath = body?.storage_path;

  if (!filename || !storagePath || typeof filename !== "string" || typeof storagePath !== "string") {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "filename and storage_path are required." } }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id: user.id, filename, status: "processing", storage_path: storagePath })
    .select("id")
    .single();
  if (error || !data) {
    return Response.json({ error: { code: "DB_ERROR", message: error?.message ?? "Insert failed." } }, { status: 500 });
  }

  const documentId = data.id as string;

  // Extract text inline — fast. Groq runs in the worker.
  try {
    const file = await supabase.storage.from("lectures").download(storagePath);
    if (file.error || !file.data) throw new Error(file.error?.message ?? "Download failed");

    const buffer = await file.data.arrayBuffer();
    const text = await extractTextFromFile(buffer, filename);
    if (!text || text.trim().length < 50) throw new Error("Extracted text was too short to analyse.");

    await supabase
      .from("documents")
      .update({ extracted_text: text, status: "detecting_topics" })
      .eq("id", documentId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Extraction failed";
    await supabase.from("documents").update({ status: "failed", error: msg }).eq("id", documentId);
    return Response.json({ error: { code: "EXTRACTION_FAILED", message: msg } }, { status: 500 });
  }

  return Response.json({ document_id: documentId, status: "detecting_topics", filename }, { status: 201 });
}
