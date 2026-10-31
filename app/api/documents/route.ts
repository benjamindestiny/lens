import { createClient } from "@/lib/supabase/server";
import { createDocument, processDocument } from "@/lib/documents";

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

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "No file provided." } }, { status: 400 });
  }
  if (!/\.(pdf|pptx)$/i.test(file.name)) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Only PDF and PPTX are supported." } }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  try {
    const id = await createDocument(supabase, user.id, file);
    processDocument(supabase, id, buffer, file.name).catch(() => {});
    return Response.json({ document_id: id, status: "uploaded", filename: file.name }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return Response.json({ error: { code: "UPLOAD_FAILED", message: msg } }, { status: 500 });
  }
}
