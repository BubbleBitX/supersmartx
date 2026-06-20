import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { createCashfreeOrder, getCheckoutPlan, getPlanConfig } from "@/lib/server/cashfree";
import { paymentsEnabled } from "@/lib/server/feature-flags";
import { createPaymentOrderForUser, updatePaymentOrderAfterCheckout } from "@/lib/server/payment-repository";
import { getProfileByUserId } from "@/lib/server/profile-repository";

export async function GET(request: NextRequest) {
  if (!paymentsEnabled()) {
    return NextResponse.redirect(new URL("/pricing?error=payments_disabled", request.url));
  }

  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const plan = getCheckoutPlan(request.nextUrl.searchParams.get("plan"));
    if (!plan) {
      return NextResponse.redirect(new URL("/pricing?error=invalid_plan", request.url));
    }

    const planConfig = getPlanConfig(plan);
    const profile = await getProfileByUserId(user.id);
    const providerOrderId = `ssx_${plan}_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    await createPaymentOrderForUser({
      amountPaise: planConfig.amountPaise,
      billingInterval: planConfig.billingInterval,
      plan: planConfig.userPlan,
      productKey: planConfig.productKey,
      providerOrderId,
      userId: user.id,
    });

    const cashfreeOrder = await createCashfreeOrder({
      amountPaise: planConfig.amountPaise,
      appBaseUrl,
      customer: {
        email: user.email ?? null,
        id: user.id,
        name: profile.name,
      },
      orderId: providerOrderId,
      plan,
    });

    await updatePaymentOrderAfterCheckout({
      cfOrderId: cashfreeOrder.cfOrderId,
      paymentSessionId: cashfreeOrder.paymentSessionId,
      providerOrderId,
      providerPayload: cashfreeOrder.providerPayload,
      status: cashfreeOrder.status,
    });

    const checkoutUrl = new URL("/payment/checkout", request.url);
    checkoutUrl.searchParams.set("mode", process.env.CASHFREE_ENV === "production" ? "production" : "sandbox");
    checkoutUrl.searchParams.set("order_id", providerOrderId);
    checkoutUrl.searchParams.set("payment_session_id", cashfreeOrder.paymentSessionId);
    checkoutUrl.searchParams.set("plan", plan);

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.redirect(new URL("/pricing?error=checkout_failed", request.url));
  }
}
