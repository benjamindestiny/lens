"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            lens
          </Link>
        </div>

        <Card className="mt-8">
          <CardBody>
            <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
            <p className="mt-1 text-sm text-muted">
              We&apos;ll email you a link to set a new one.
            </p>

            {sent ? (
              <div className="mt-6 rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-sm text-success">
                If that email is registered, a reset link is on its way.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
