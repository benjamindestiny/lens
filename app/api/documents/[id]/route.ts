import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Not signed in." } }, { status: 401 });
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", id)
    .single();
  if (!doc) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Document not found." } }, { status: 404 });
  }

  if (doc.storage_path) {
    const { error: rmErr } = await supabase.storage
      .from("lectures")
      .remove([doc.storage_path]);
    if (rmErr) {
      return Response.json(
        { error: { code: "STORAGE_ERROR", message: rmErr.message } },
        { status: 500 }
      );
    }
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    return Response.json({ error: { code: "DB_ERROR", message: error.message } }, { status: 500 });
  }

  return Response.json({ deleted: true });
}
