import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteDocumentButton } from "@/components/delete-document-button";

function statusLabel(status: string, lessonCount: number): string {
  switch (status) {
    case "ready":
      return lessonCount > 0 ? `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"} ready` : "Ready";
    case "processing":
      return "Finding topics…";
    case "topics_ready":
      return "Topics found — review";
    case "generating":
      return "Generating lessons…";
    case "failed":
      return "Processing failed";
    default:
      return status;
  }
}

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, status, created_at, topics(count), lessons(count)")
    .order("created_at", { ascending: false });

  const hasDocuments = documents && documents.length > 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Your documents</h1>
          <p className="mt-1 text-sm text-muted">
            Upload lecture material and turn it into lessons.
          </p>
        </div>
        <ButtonLink href="/upload">Upload lecture</ButtonLink>
      </div>

      {!hasDocuments ? (
        <div className="mt-10">
          <EmptyState
            title="No documents yet"
            description="Upload a PDF or PowerPoint lecture and we'll detect its topics and build lessons around them."
            action={<ButtonLink href="/upload">Upload your first lecture</ButtonLink>}
          />
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {documents.map((d) => {
            const topicCount = Array.isArray(d.topics) ? d.topics[0]?.count ?? 0 : 0;
            const lessonCount = Array.isArray(d.lessons) ? d.lessons[0]?.count ?? 0 : 0;
            return (
              <li key={d.id}>
                <Card className="transition-colors hover:border-muted/40">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-foreground">{d.filename}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Badge tone={statusTone(d.status)}>{statusLabel(d.status, lessonCount)}</Badge>
                        {topicCount > 0 && (
                          <span className="text-xs text-muted">
                            {topicCount} {topicCount === 1 ? "topic" : "topics"}
                          </span>
                        )}
                        <span className="text-xs text-muted">
                          {new Date(d.created_at).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <DeleteDocumentButton documentId={d.id} filename={d.filename} />
                      <ButtonLink href={`/documents/${d.id}`} variant="secondary" size="sm">
                        Open
                      </ButtonLink>
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
