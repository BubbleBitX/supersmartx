"use client";

import { useEffect, useState } from "react";

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

export default function PaymentSuccessStatus({ orderId }: { orderId: string }) {
  const [payload, setPayload] = useState<OrderPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      try {
        const response = await fetch(`/api/payment/orders/${encodeURIComponent(orderId)}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to confirm payment status yet.");
        }

        const nextPayload = (await response.json()) as OrderPayload;
        if (cancelled) {
          return;
        }

        setPayload(nextPayload);
        if (nextPayload.order.status !== "paid" && attempts < 10) {
          attempts += 1;
          window.setTimeout(() => {
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
    };
  }, [orderId]);

  if (errorMessage) {
    return (
      <p style={{ fontSize: "12px", color: "#9b7f7f", margin: "0 0 24px", lineHeight: 1.6 }}>
        {errorMessage}
      </p>
    );
  }

  if (payload?.order.status === "paid") {
    if (payload.order.billingInterval === "lifetime") {
      return (
        <p style={{ fontSize: "13px", color: "#a3e635", margin: "0 0 24px", lineHeight: 1.6 }}>
          Lifetime access is active now.
        </p>
      );
    }

    if (payload.order.accessEndsAt) {
      return (
        <p style={{ fontSize: "13px", color: "#a3e635", margin: "0 0 24px", lineHeight: 1.6 }}>
          Pro access is active through {formatDate(payload.order.accessEndsAt)}.
        </p>
      );
    }
  }

  return (
    <p style={{ fontSize: "12px", color: "#8d8d8d", margin: "0 0 24px", lineHeight: 1.6 }}>
      Payment received. Access activation can take a few seconds while we confirm the webhook.
    </p>
  );
}
