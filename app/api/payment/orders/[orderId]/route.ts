import { NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { getPaymentOrderForUser } from "@/lib/server/payment-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);
    const { orderId } = await context.params;
    const order = await getPaymentOrderForUser({
      providerOrderId: orderId,
      userId: user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        accessEndsAt: order.accessEndsAt?.toISOString() ?? null,
        accessStartsAt: order.accessStartsAt?.toISOString() ?? null,
        amountPaise: order.amountPaise,
        billingInterval: order.billingInterval,
        paidAt: order.paidAt?.toISOString() ?? null,
        plan: order.plan,
        productKey: order.productKey,
        providerOrderId: order.providerOrderId,
        status: order.status,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to load payment order." }, { status: 500 });
  }
}
