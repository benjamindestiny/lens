import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your documents</h1>
        <Link href="/upload"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
          Upload lecture
        </Link>
      </div>
      {!documents || documents.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">No documents yet. Upload a PDF or PowerPoint to get started.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium">{d.filename}</p>
                <p className="text-sm text-muted">{d.status}</p>
              </div>
              <Link href={`/documents/${d.id}`}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
