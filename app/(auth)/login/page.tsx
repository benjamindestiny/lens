"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-2 text-sm text-muted">Welcome back.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent" />
        <input type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        No account? <Link href="/signup" className="text-accent">Create one</Link>
      </p>
    </main>
  );
}
