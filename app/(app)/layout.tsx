import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight text-foreground">
            lens
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="ml-2 h-4 w-px bg-border" />
            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
              Free plan
            </span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-muted transition-colors hover:text-foreground">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
    </div>
  );
}
