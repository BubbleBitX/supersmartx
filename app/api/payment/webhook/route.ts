import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, order_status, customer_details } = body?.data?.order ?? {};

  if (order_status !== "PAID") {
    return NextResponse.json({ received: true });
  }

  // Parse plan from order_id: g2o_pro_1234567890
  const plan = order_id?.split("_")[1] ?? "pro";

  if (supabase && customer_details?.customer_email) {
    await supabase
      .from("users")
      .update({ plan })
      .eq("email", customer_details.customer_email);
  }

  console.log(`Payment confirmed: ${order_id} — plan: ${plan}`);
  return NextResponse.json({ received: true });
}
