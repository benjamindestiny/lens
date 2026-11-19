import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success") {
    const { metadata } = event.data;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from("profiles").update({ plan: metadata.plan }).eq("id", metadata.user_id);
  }

  return new Response("ok", { status: 200 });
}