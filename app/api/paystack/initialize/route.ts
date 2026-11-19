import { createClient } from "@/lib/supabase/server";

const PLANS: Record<string, number> = {
  premium: 200000, // NGN 2,000 in kobo
  plus: 500000,    // NGN 5,000 in kobo
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { plan } = await req.json();
  if (!PLANS[plan]) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: PLANS[plan],
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/callback`,
      metadata: { user_id: user.id, plan },
    }),
  });

  const data = await res.json();
  if (!data.status) return Response.json({ error: data.message }, { status: 500 });

  return Response.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  });
}