import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("id, status, error")
    .eq("id", id)
    .single();
  if (error || !data) return Response.json({ error: { code: "NOT_FOUND", message: "Document not found." } }, { status: 404 });

  return Response.json({
    document_id: data.id,
    status: data.status,
    progress: data.status === "processing" ? 0.4 : data.status === "ready" ? 1 : 0.7,
    message: data.status === "processing" ? "Extracting text and detecting topics" : null,
    error: data.error ? { code: "PROCESSING_FAILED", message: data.error } : null,
  });
}
