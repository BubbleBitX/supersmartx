import crypto from "node:crypto";
import { BillingInterval, PaymentStatus, UserPlan } from "@prisma/client";

export type CheckoutPlan = "pro" | "lifetime";

type PlanConfig = {
  accessLabel: string;
  amountPaise: number;
  billingInterval: BillingInterval;
  label: string;
  productKey: string;
  userPlan: UserPlan;
};

const PLAN_CONFIG: Record<CheckoutPlan, PlanConfig> = {
  pro: {
    accessLabel: "30 days access",
    amountPaise: 19900,
    billingInterval: BillingInterval.days30,
    label: "Pro",
    productKey: "pro_30d",
    userPlan: UserPlan.pro,
  },
  lifetime: {
    accessLabel: "Lifetime access",
    amountPaise: 99900,
    billingInterval: BillingInterval.lifetime,
    label: "Lifetime",
    productKey: "lifetime",
    userPlan: UserPlan.lifetime,
  },
};

export function getCheckoutPlan(value: string | null | undefined): CheckoutPlan | null {
  if (value === "pro" || value === "lifetime") {
    return value;
  }

  return null;
}

export function getPlanConfig(plan: CheckoutPlan): PlanConfig {
  return PLAN_CONFIG[plan];
}

export function getCashfreeMode() {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

export function getCashfreeApiVersion() {
  return process.env.CASHFREE_API_VERSION || "2025-01-01";
}

export function getCashfreeBaseUrl() {
  return getCashfreeMode() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

export function assertCashfreeConfigured() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error("CASHFREE_NOT_CONFIGURED");
  }

  return {
    appId,
    secretKey,
    mode: getCashfreeMode(),
    apiVersion: getCashfreeApiVersion(),
    baseUrl: getCashfreeBaseUrl(),
  };
}

function sanitizeCustomerPhone(phone?: string | null) {
  const digits = (phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return "9999999999";
}

function sanitizeCustomerName(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    return name.trim().slice(0, 60);
  }

  if (email && email.includes("@")) {
    return email.split("@")[0].slice(0, 60);
  }

  return "SuperSmartX User";
}

export async function createCashfreeOrder(input: {
  amountPaise: number;
  appBaseUrl: string;
  customer: {
    email?: string | null;
    id: string;
    name?: string | null;
    phone?: string | null;
  };
  orderId: string;
  plan: CheckoutPlan;
}) {
  const config = assertCashfreeConfigured();
  const amount = Number((input.amountPaise / 100).toFixed(2));
  const response = await fetch(`${config.baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": config.apiVersion,
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
      "x-request-id": crypto.randomUUID(),
      "x-idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: input.customer.id,
        customer_email: input.customer.email || undefined,
        customer_name: sanitizeCustomerName(input.customer.name, input.customer.email),
        customer_phone: sanitizeCustomerPhone(input.customer.phone),
      },
      order_meta: {
        return_url: `${input.appBaseUrl}/payment/success?plan=${encodeURIComponent(input.plan)}&order_id=${encodeURIComponent(input.orderId)}`,
        notify_url: `${input.appBaseUrl}/api/payment/webhook`,
      },
      order_note: `SuperSmartX ${PLAN_CONFIG[input.plan].label} ${PLAN_CONFIG[input.plan].accessLabel}`,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || typeof payload !== "object") {
    throw new Error("CASHFREE_CREATE_ORDER_FAILED");
  }

  const typedPayload = payload as {
    cf_order_id?: string;
    order_status?: string;
    payment_session_id?: string;
  };

  if (!typedPayload.payment_session_id) {
    throw new Error("CASHFREE_SESSION_MISSING");
  }

  return {
    cfOrderId: typedPayload.cf_order_id || null,
    paymentSessionId: typedPayload.payment_session_id,
    providerPayload: payload,
    status: mapCashfreeOrderStatus(typedPayload.order_status),
  };
}

export function mapCashfreeOrderStatus(status: string | null | undefined): PaymentStatus {
  const normalized = (status || "").toUpperCase();

  switch (normalized) {
    case "PAID":
    case "SUCCESS":
      return PaymentStatus.paid;
    case "FAILED":
      return PaymentStatus.failed;
    case "CANCELLED":
    case "USER_DROPPED":
    case "TERMINATED":
      return PaymentStatus.cancelled;
    case "ACTIVE":
    case "PENDING":
    case "NOT_ATTEMPTED":
    default:
      return PaymentStatus.pending;
  }
}

export function verifyCashfreeWebhookSignature(input: {
  payload: string;
  signature: string;
  timestamp: string;
}) {
  const { secretKey } = assertCashfreeConfigured();
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(`${input.timestamp}${input.payload}`)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(input.signature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function getWebhookEventHash(payload: string) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function extractCashfreeWebhookData(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const data = raw.data && typeof raw.data === "object" ? (raw.data as Record<string, unknown>) : raw;
  const payment = data.payment && typeof data.payment === "object" ? (data.payment as Record<string, unknown>) : data;
  const order = data.order && typeof data.order === "object" ? (data.order as Record<string, unknown>) : data;

  const providerOrderId = String(
    payment.order_id || order.order_id || raw.order_id || "",
  ).trim();
  const paymentStatus = String(
    payment.payment_status || raw.payment_status || order.order_status || raw.order_status || "",
  ).trim();
  const cfPaymentId = String(payment.cf_payment_id || raw.cf_payment_id || "").trim();

  if (!providerOrderId) {
    return null;
  }

  return {
    cfPaymentId: cfPaymentId || null,
    paymentStatus,
    providerOrderId,
  };
}
