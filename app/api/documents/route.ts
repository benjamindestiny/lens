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

  return Response.json({ error: { code: "EXTRACTION_FAILED", message: msg } }, { status: 500 });
  }

  return Response.json({ document_id: documentId, status: "detecting_topics", filename }, { status: 201 });
}
