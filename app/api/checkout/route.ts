import { NextRequest, NextResponse } from "next/server";

const PLANS: Record<string, { amount: number; name: string; recurring: boolean }> = {
  pro:      { amount: 19900, name: "SuperSmartX Pro",      recurring: true  }, // paise
  lifetime: { amount: 99900, name: "SuperSmartX Lifetime", recurring: false },
};

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan") ?? "";

  if (!PLANS[plan]) {
    return NextResponse.redirect(new URL("/pricing", req.url));
  }

  const appId    = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const env      = process.env.NEXT_PUBLIC_CASHFREE_ENV ?? "sandbox";

  if (!appId || !secretKey) {
    // Dev mode: redirect back with a message
    return NextResponse.redirect(
      new URL(`/pricing?error=cashfree_not_configured`, req.url)
    );
  }

  const baseUrl = env === "production"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

  const orderId = `g2o_${plan}_${Date.now()}`;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const body = {
    order_id:       orderId,
    order_amount:   PLANS[plan].amount / 100,
    order_currency: "INR",
    order_note:     PLANS[plan].name,
    customer_details: {
      customer_id:    "user_" + Date.now(),
      customer_email: "user@example.com", // replace with real user email from Clerk
      customer_phone: "9999999999",
    },
    order_meta: {
      return_url: `${appUrl}/payment/success?order_id={order_id}&plan=${plan}`,
      notify_url: `${appUrl}/api/payment/webhook`,
    },
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id":   appId,
      "x-client-secret": secretKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Cashfree error:", data);
    return NextResponse.redirect(new URL(`/pricing?error=payment_failed`, req.url));
  }

  // Redirect to Cashfree payment page
  return NextResponse.redirect(data.payment_session_url ?? `/pricing?error=no_session`);
}
