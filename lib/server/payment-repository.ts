import {
  BillingInterval,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  UserPlan,
  WebhookProcessingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAccessWindow } from "@/lib/server/access";

export async function createPaymentOrderForUser(input: {
  amountPaise: number;
  billingInterval: BillingInterval;
  plan: UserPlan;
  productKey: string;
  providerOrderId: string;
  userId: string;
}) {
  return prisma.paymentOrder.create({
    data: {
      userId: input.userId,
      provider: PaymentProvider.cashfree,
      productKey: input.productKey,
      plan: input.plan,
      billingInterval: input.billingInterval,
      amountPaise: input.amountPaise,
      providerOrderId: input.providerOrderId,
      status: PaymentStatus.created,
    },
  });
}

export async function getPaymentOrderForUser(input: { providerOrderId: string; userId: string }) {
  return prisma.paymentOrder.findFirst({
    where: {
      providerOrderId: input.providerOrderId,
      userId: input.userId,
    },
  });
}

export async function getPaymentOrderByProviderOrderId(providerOrderId: string) {
  return prisma.paymentOrder.findUnique({
    where: { providerOrderId },
  });
}

export async function updatePaymentOrderAfterCheckout(input: {
  cfOrderId?: string | null;
  paymentSessionId?: string | null;
  providerOrderId: string;
  providerPayload: unknown;
  status: PaymentStatus;
}) {
  return prisma.paymentOrder.update({
    where: { providerOrderId: input.providerOrderId },
    data: {
      cfOrderId: input.cfOrderId ?? null,
      paymentSessionId: input.paymentSessionId ?? null,
      providerPayload: input.providerPayload as Prisma.InputJsonValue,
      status: input.status,
    },
  });
}

export async function activatePaidOrder(input: {
  paidAt?: Date;
  providerOrderId: string;
  providerPayload: unknown;
}) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.paymentOrder.findUnique({
      where: { providerOrderId: input.providerOrderId },
    });

    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (existingOrder.status === PaymentStatus.paid) {
      return existingOrder;
    }

    const accessWindow = getAccessWindow({
      billingInterval: existingOrder.billingInterval,
      paidAt: input.paidAt,
    });

    const order = await tx.paymentOrder.update({
      where: { providerOrderId: input.providerOrderId },
      data: {
        providerPayload: input.providerPayload as Prisma.InputJsonValue,
        status: PaymentStatus.paid,
        paidAt: accessWindow.startsAt,
        accessStartsAt: accessWindow.startsAt,
        accessEndsAt: accessWindow.endsAt,
      },
    });

    await tx.accessGrant.upsert({
      where: { orderId: order.id },
      update: {
        status: "active",
        startsAt: accessWindow.startsAt,
        endsAt: accessWindow.endsAt,
        metadata: input.providerPayload as Prisma.InputJsonValue,
        revokedAt: null,
      },
      create: {
        userId: order.userId,
        orderId: order.id,
        provider: order.provider,
        productKey: order.productKey,
        plan: order.plan,
        billingInterval: order.billingInterval,
        status: "active",
        startsAt: accessWindow.startsAt,
        endsAt: accessWindow.endsAt,
        metadata: input.providerPayload as Prisma.InputJsonValue,
      },
    });

    return order;
  });
}

export async function markPaymentOrderOutcome(input: {
  providerOrderId: string;
  providerPayload: unknown;
  status: PaymentStatus;
}) {
  return prisma.paymentOrder.update({
    where: { providerOrderId: input.providerOrderId },
    data: {
      providerPayload: input.providerPayload as Prisma.InputJsonValue,
      status: input.status,
    },
  });
}

export async function findWebhookEventByFingerprint(input: {
  eventHash: string;
  providerEventId?: string | null;
}) {
  if (input.providerEventId) {
    const byProviderEventId = await prisma.webhookEvent.findUnique({
      where: { providerEventId: input.providerEventId },
    });

    if (byProviderEventId) {
      return byProviderEventId;
    }
  }

  return prisma.webhookEvent.findUnique({
    where: { eventHash: input.eventHash },
  });
}

export async function recordWebhookEvent(input: {
  eventHash: string;
  payload: unknown;
  paymentStatus?: string | null;
  providerEventId?: string | null;
  providerOrderId?: string | null;
  userId?: string | null;
}) {
  return prisma.webhookEvent.create({
    data: {
      userId: input.userId ?? null,
      provider: PaymentProvider.cashfree,
      providerEventId: input.providerEventId ?? null,
      eventHash: input.eventHash,
      providerOrderId: input.providerOrderId ?? null,
      paymentStatus: input.paymentStatus ?? null,
      processingStatus: WebhookProcessingStatus.received,
      payload: input.payload as Prisma.InputJsonValue,
    },
  });
}

export async function updateWebhookEventState(input: {
  errorMessage?: string | null;
  id: string;
  processingStatus: WebhookProcessingStatus;
}) {
  return prisma.webhookEvent.update({
    where: { id: input.id },
    data: {
      errorMessage: input.errorMessage ?? null,
      processingStatus: input.processingStatus,
      processedAt: input.processingStatus === WebhookProcessingStatus.processed || input.processingStatus === WebhookProcessingStatus.ignored
        ? new Date()
        : null,
    },
  });
}
