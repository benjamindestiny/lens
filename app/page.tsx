import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-4 text-sm font-medium text-accent">lens</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Learn something. Actually understand it.
      </h1>
      <p className="mt-6 text-lg text-muted">
        Your lecture materials, transformed into lessons you can understand.
        Upload a PDF or PowerPoint and get short video lessons, topic by topic.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
