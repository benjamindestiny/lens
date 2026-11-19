"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BillingCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying your payment…");

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setStatus("No payment reference found.");
      return;
    }
    fetch(`/api/paystack/verify?reference=${reference}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("Payment confirmed. Upgrading your plan…");
          setTimeout(() => router.push("/billing"), 1500);
        } else {
          setStatus(data.error ?? "Payment could not be verified.");
        }
      })
      .catch(() => setStatus("Verification failed."));
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="mt-4 text-base text-muted">{status}</p>
      </div>
    </div>
  );
}