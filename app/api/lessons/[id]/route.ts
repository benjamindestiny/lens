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
    .select("id, title, video_url, duration_seconds, document_id, topic_id")
    .eq("id", id)
    .single();
  if (error || !data) return Response.json({ error: { code: "NOT_FOUND", message: "Lesson not found." } }, { status: 404 });
  return Response.json(data);
}
