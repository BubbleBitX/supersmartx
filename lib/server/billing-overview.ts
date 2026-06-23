import { getUserEntitlements } from "@/lib/server/access";
import { getLatestPaymentOrderForUser } from "@/lib/server/payment-repository";

export async function getBillingOverviewForUser(userId: string) {
  const [entitlements, latestOrder] = await Promise.all([
    getUserEntitlements(userId),
    getLatestPaymentOrderForUser(userId),
  ]);

  return {
    entitlements,
    latestOrder: latestOrder
      ? {
          accessEndsAt: latestOrder.accessEndsAt?.toISOString() ?? null,
          accessStartsAt: latestOrder.accessStartsAt?.toISOString() ?? null,
          amountPaise: latestOrder.amountPaise,
          billingInterval: latestOrder.billingInterval,
          createdAt: latestOrder.createdAt.toISOString(),
          paidAt: latestOrder.paidAt?.toISOString() ?? null,
          plan: latestOrder.plan,
          providerOrderId: latestOrder.providerOrderId,
          status: latestOrder.status,
        }
      : null,
  };
}
