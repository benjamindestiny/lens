"use client";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const plans = [
  {
    name: "Free",
    tagline: "For trying lens on your own material.",
    features: [
      "A small number of documents",
      "Topic detection and review",
      "Lessons for each document",
    ],
    cta: "active" as const,
  },
  {
    name: "Premium",
    tagline: "For students using lens every week.",
    features: [
      "More documents per month",
      "Higher upload limits",
      "Priority processing",
    ],
    cta: "waitlist" as const,
  },
  {
    name: "Plus",
    tagline: "For heavy revision periods.",
    features: [
      "Everything in Premium",
      "More room per document",
      "Early access to new features",
    ],
    cta: "waitlist" as const,
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function joinWaitlist(planName: string) {
    if (!email) {
      setError("Enter your email to join the waitlist.");
      return;
    }
    setBusy(planName);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({ email, plan: planName });
    setBusy(null);
    if (error) {
      setError(error.code === "23505" ? "You're already on the list." : error.message);
      return;
    }
    setJoined(planName);
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
            lens
          </Link>
          <nav className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Start free. Upgrade when it helps.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          The free plan covers your first documents. Paid plans give you more room once lens
          becomes part of how you study.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.cta === "active" ? "border-accent/40" : ""}>
              <CardBody className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                  {plan.cta === "waitlist" && <Badge tone="accent">Coming soon</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.cta === "active" ? (
                    <ButtonLink href="/signup" className="w-full">
                      Start free
                    </ButtonLink>
                  ) : joined === plan.name ? (
                    <p className="rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-center text-sm text-success">
                      We&apos;ll email you when {plan.name} opens.
                    </p>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={busy === plan.name}
                      onClick={() => joinWaitlist(plan.name)}
                    >
                      {busy === plan.name ? "Joining…" : "Join the waitlist"}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <label htmlFor="waitlist-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email for the waitlist
          </label>
          <Input
            id="waitlist-email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <p className="mt-2 text-xs text-muted">
            One email when paid plans open. No newsletter.
          </p>
        </div>
      </section>
    </main>
  );
}
