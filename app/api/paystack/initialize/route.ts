import { createClient } from "@/lib/supabase/server";

const PLANS: Record<string, number> = {
  premium: 200000,
  plus: 500000,
};

export async function POST(req: Request) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return Response.json(
      { error: "Paystack is not configured on the server." },
      { status: 500 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Not signed in" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!PLANS[plan]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const callbackUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      new URL("/billing/callback", req.url).toString();

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: PLANS[plan],
        callback_url: callbackUrl,
        metadata: { user_id: user.id, plan },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status || !data.data?.authorization_url) {
      console.error("Paystack initialize failed", res.status, data);
      return Response.json(
        { error: data.message ?? "Payment provider rejected the request." },
        { status: res.status >= 400 && res.status < 500 ? res.status : 502 },
      );
    }

    return Response.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialize error", error);
    return Response.json(
      { error: "Could not start payment." },
      { status: 500 },
    );
  }
}
