"use client";

import { useEffect, useState, type ReactNode } from "react";

type OrderState = "created" | "pending" | "paid" | "failed" | "cancelled";
type BillingInterval = "none" | "days30" | "lifetime";

type OrderPayload = {
  order: {
    accessEndsAt: string | null;
    accessStartsAt: string | null;
    billingInterval: BillingInterval;
    status: OrderState;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusMessage({ color, children }: { color: string; children: ReactNode }) {
  return <p style={{ fontSize: "12px", color, margin: "0 0 24px", lineHeight: 1.6 }}>{children}</p>;
}

export default function PaymentSuccessStatus({ orderId }: { orderId: string }) {
  const [payload, setPayload] = useState<OrderPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let retryTimer: number | null = null;

    const load = async () => {
      try {
        const response = await fetch(`/api/payment/orders/${encodeURIComponent(orderId)}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          throw new Error("Sign in again to confirm your billing status.");
        }

        if (response.status === 404) {
          throw new Error("We could not find this payment record.");
        }

        if (!response.ok) {
          throw new Error("Unable to confirm payment status yet.");
        }

        const nextPayload = (await response.json()) as OrderPayload;
        if (cancelled) {
          return;
        }

        setErrorMessage(null);
        setPayload(nextPayload);

        if ((nextPayload.order.status === "created" || nextPayload.order.status === "pending") && attempts < 10) {
          attempts += 1;
          retryTimer = window.setTimeout(() => {
            void load();
          }, 2000);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Unable to confirm payment status yet.");
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [orderId]);

  if (errorMessage) {
    return <StatusMessage color="#d3a3a3">{errorMessage}</StatusMessage>;
  }

  if (!payload) {
    return <StatusMessage color="#8d8d8d">Checking your payment status.</StatusMessage>;
  }

  if (payload.order.status === "paid") {
    if (payload.order.billingInterval === "lifetime") {
      return <StatusMessage color="#a3e635">Lifetime access is active now.</StatusMessage>;
    }

    if (payload.order.accessEndsAt) {
      return <StatusMessage color="#a3e635">Pro access is active through {formatDate(payload.order.accessEndsAt)}.</StatusMessage>;
    }

    return <StatusMessage color="#a3e635">Payment confirmed. Your paid access is active now.</StatusMessage>;
  }

  if (payload.order.status === "failed") {
    return <StatusMessage color="#fda4af">Payment failed. You can try checkout again from pricing.</StatusMessage>;
  }

  if (payload.order.status === "cancelled") {
    return <StatusMessage color="#fbcfe8">Payment was cancelled. No paid access was added.</StatusMessage>;
  }

  return (
    <StatusMessage color="#8d8d8d">
      Payment received. Access activation can take a few seconds while we confirm the webhook.
    </StatusMessage>
  );
}
