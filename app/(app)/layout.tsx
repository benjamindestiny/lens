import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-sm font-semibold text-accent">lens</Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted">Free plan</span>
            <form action="/auth/signout" method="post">
              <button className="text-xs text-muted hover:text-foreground">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
