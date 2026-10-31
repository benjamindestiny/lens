import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          lens
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-base text-muted">
          The link may be broken, or the document may have been deleted.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/dashboard">Go to your documents</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
