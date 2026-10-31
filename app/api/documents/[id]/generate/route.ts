import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });

  const { data: topics, error: tErr } = await supabase
    .from("topics")
    .select("id, title")
    .eq("document_id", id)
    .eq("selected", true);
  if (tErr) return Response.json({ error: { code: "DB_ERROR", message: tErr.message } }, { status: 500 });
  if (!topics || topics.length === 0) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "No topics selected." } }, { status: 400 });
  }

  const { error: gErr } = await supabase.from("documents").update({ status: "generating" }).eq("id", id);
  if (gErr) return Response.json({ error: { code: "DB_ERROR", message: gErr.message } }, { status: 500 });

  const { error: dErr } = await supabase.from("lessons").delete().eq("document_id", id);
  if (dErr) return Response.json({ error: { code: "DB_ERROR", message: dErr.message } }, { status: 500 });

  const rows = topics.map((t) => ({
    document_id: id,
    topic_id: t.id,
    title: t.title,
    status: "ready" as const,
    duration_seconds: 240,
    video_url: "/demo.mp4",
  }));
  const { error: iErr } = await supabase.from("lessons").insert(rows);
  if (iErr) return Response.json({ error: { code: "DB_ERROR", message: iErr.message } }, { status: 500 });

  const { error: rErr } = await supabase.from("documents").update({ status: "ready" }).eq("id", id);
  if (rErr) return Response.json({ error: { code: "DB_ERROR", message: rErr.message } }, { status: 500 });

  return Response.json({ document_id: id, status: "ready" }, { status: 202 });
}
