"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  { id: "free", name: "Free", price: "₦0", features: ["1 document", "Slow generation"] },
  { id: "premium", name: "Premium", price: "₦2,000/mo", features: ["10 documents", "Faster generation"] },
  { id: "plus", name: "Plus", price: "₦5,000/mo", features: ["Unlimited documents", "Fastest generation"] },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from("profiles").select("plan").eq("id", data.user.id).single()
          .then(({ data: profile }) => {
            if (profile?.plan) setCurrentPlan(profile.plan);
          });
      }
    });
  }, []);

  async function upgrade(planId: string) {
    setBusy(planId);
    setError(null);
    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start payment.");
      setBusy(null);
      return;
    }
    window.location.href = data.authorization_url;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold text-foreground">Billing</h1>
      <p className="mt-2 text-base text-muted">Upgrade to get more documents and faster generation.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={currentPlan === plan.id ? "border-accent/60" : ""}>
            <CardBody className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                {currentPlan === plan.id && <Badge tone="accent">Current</Badge>}
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{plan.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                {plan.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <div className="mt-6">
                {plan.id === "free" ? (
                  <Button variant="secondary" className="w-full" disabled>Current plan</Button>
                ) : currentPlan === plan.id ? (
                  <Button variant="secondary" className="w-full" disabled>Active</Button>
                ) : (
                  <Button className="w-full" disabled={busy === plan.id} onClick={() => upgrade(plan.id)}>
                    {busy === plan.id ? "Redirecting…" : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}