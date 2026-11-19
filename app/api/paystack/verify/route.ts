import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  if (!reference) return Response.json({ error: "No reference" }, { status: 400 });

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const data = await res.json();

  if (!data.status || data.data?.status !== "success") {
    return Response.json({ error: "Payment not successful" }, { status: 400 });
  }

  const supabase = await createClient();
  const userId = data.data.metadata.user_id;
  const plan = data.data.metadata.plan;

  await supabase.from("profiles").update({ plan }).eq("id", userId);

  return Response.json({ status: "success", plan });
}