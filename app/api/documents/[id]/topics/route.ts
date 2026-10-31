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
    .from("topics")
    .select("id, title, summary, order, selected")
    .eq("document_id", id)
    .order("order", { ascending: true });
  if (error) return Response.json({ error: { code: "DB_ERROR", message: error.message } }, { status: 500 });
  return Response.json({ document_id: id, topics: data ?? [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });

  const body = await req.json().catch(() => null);
  const topicIds: string[] | undefined = body?.topic_ids;
  if (!Array.isArray(topicIds)) {
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "topic_ids must be an array." } }, { status: 400 });
  }

  await supabase.from("topics").update({ selected: false }).eq("document_id", id);
  if (topicIds.length > 0) {
    await supabase.from("topics").update({ selected: true }).in("id", topicIds);
  }
  return Response.json({ document_id: id, status: "topics_ready", selected_count: topicIds.length });
}
