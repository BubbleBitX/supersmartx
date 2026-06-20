import { NextResponse } from "next/server";
import {
  extractCashfreeWebhookData,
  getWebhookEventHash,
  mapCashfreeOrderStatus,
  verifyCashfreeWebhookSignature,
} from "@/lib/server/cashfree";
import {
  activatePaidOrder,
  findWebhookEventByFingerprint,
  getPaymentOrderByProviderOrderId,
  markPaymentOrderOutcome,
  recordWebhookEvent,
  updateWebhookEventState,
} from "@/lib/server/payment-repository";

export async function POST(request: Request) {
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");
  const rawPayload = await request.text();

  if (!signature || !timestamp) {
    return NextResponse.json({ received: false, error: "Missing webhook signature headers." }, { status: 401 });
  }

  try {
    const isValidSignature = verifyCashfreeWebhookSignature({
      payload: rawPayload,
      signature,
      timestamp,
    });

    if (!isValidSignature) {
      return NextResponse.json({ received: false, error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawPayload) as unknown;
    const webhook = extractCashfreeWebhookData(payload);

    if (!webhook) {
      return NextResponse.json({ received: false, error: "Invalid webhook payload." }, { status: 400 });
    }

    const eventHash = getWebhookEventHash(rawPayload);
    const existingEvent = await findWebhookEventByFingerprint({
      eventHash,
      providerEventId: webhook.cfPaymentId,
    });

    if (existingEvent) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const paymentOrder = await getPaymentOrderByProviderOrderId(webhook.providerOrderId);
    const webhookEvent = await recordWebhookEvent({
      eventHash,
      payload,
      paymentStatus: webhook.paymentStatus,
      providerEventId: webhook.cfPaymentId,
      providerOrderId: webhook.providerOrderId,
      userId: paymentOrder?.userId ?? null,
    });

    try {
      if (webhook.paymentStatus.toUpperCase() === "SUCCESS") {
        await activatePaidOrder({
          providerOrderId: webhook.providerOrderId,
          providerPayload: payload,
        });
      } else {
        await markPaymentOrderOutcome({
          providerOrderId: webhook.providerOrderId,
          providerPayload: payload,
          status: mapCashfreeOrderStatus(webhook.paymentStatus),
        });
      }

      await updateWebhookEventState({
        id: webhookEvent.id,
        processingStatus: "processed",
      });
    } catch (processingError) {
      await updateWebhookEventState({
        errorMessage: processingError instanceof Error ? processingError.message : "Webhook processing failed.",
        id: webhookEvent.id,
        processingStatus: "failed",
      });
      throw processingError;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
