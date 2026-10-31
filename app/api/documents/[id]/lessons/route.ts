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
    .from("lessons")
    .select("id, topic_id, title, status, duration_seconds, video_url, error")
    .eq("document_id", id);
  if (error) return Response.json({ error: { code: "DB_ERROR", message: error.message } }, { status: 500 });
  return Response.json({ document_id: id, lessons: data ?? [] });
}
