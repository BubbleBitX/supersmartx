import type { AppEntitlements, EffectivePlan } from "@/lib/entitlements";

type BillingOrderStatus = "created" | "pending" | "paid" | "failed" | "cancelled";
type BillingInterval = "none" | "days30" | "lifetime";

export interface BillingOrderSnapshot {
  accessEndsAt: string | null;
  accessStartsAt: string | null;
  amountPaise: number;
  billingInterval: BillingInterval;
  createdAt: string;
  paidAt: string | null;
  plan: EffectivePlan;
  providerOrderId: string;
  status: BillingOrderStatus;
}

export interface BillingOverview {
  entitlements: AppEntitlements;
  latestOrder: BillingOrderSnapshot | null;
}

export function getDefaultBillingOverview(): BillingOverview {
  return {
    entitlements: {
      plan: "free",
      accessStatus: "free",
      planExpiresAt: null,
      downloadsUsedThisPeriod: 0,
      downloadsRemaining: 5,
      features: {
        watermark: true,
        allowedThemes: ["dark", "light", "startup"],
      },
    },
    latestOrder: null,
  };
}

export async function fetchBillingOverview(): Promise<BillingOverview> {
  const response = await fetch("/api/account/billing", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return getDefaultBillingOverview();
  }

  if (!response.ok) {
    throw new Error("Failed to load billing overview.");
  }

  const payload = (await response.json()) as { overview: BillingOverview };
  return payload.overview;
}

export function formatBillingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatBillingAmountPaise(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);
}

export function formatPlanName(plan: EffectivePlan) {
  switch (plan) {
    case "pro":
      return "Pro";
    case "lifetime":
      return "Lifetime";
    default:
      return "Free";
  }
}

export function getPlanHeadline(entitlements: AppEntitlements) {
  if (entitlements.accessStatus === "expired") {
    return "Paid access expired";
  }

  switch (entitlements.plan) {
    case "pro":
      return "Pro access active";
    case "lifetime":
      return "Lifetime access active";
    default:
      return "Free plan";
  }
}

export function getPlanDetail(entitlements: AppEntitlements) {
  if (entitlements.accessStatus === "expired") {
    return "Your last paid access has ended. Renew Pro or switch to Lifetime.";
  }

  if (entitlements.plan === "lifetime") {
    return "Unlimited exports, all themes, no expiry.";
  }

  if (entitlements.plan === "pro") {
    if (entitlements.planExpiresAt) {
      return `Unlimited exports until ${formatBillingDate(entitlements.planExpiresAt)}.`;
    }

    return "Unlimited exports and watermark-free downloads.";
  }

  const remaining = entitlements.downloadsRemaining ?? 0;
  return `${remaining} free exports left this month.`;
}

export function getUsageSummary(entitlements: AppEntitlements) {
  if (entitlements.plan === "free") {
    const remaining = entitlements.downloadsRemaining ?? 0;
    return `${remaining} of 5 free exports left`;
  }

  return "Unlimited exports";
}

export function getWatermarkSummary(entitlements: AppEntitlements) {
  return entitlements.features.watermark ? "Watermark on" : "Watermark removed";
}

export function getOrderStatusLabel(status: BillingOrderStatus) {
  switch (status) {
    case "created":
      return "Created";
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function getOrderStatusTone(status: BillingOrderStatus) {
  switch (status) {
    case "paid":
      return {
        background: "rgba(182,245,77,0.12)",
        border: "rgba(182,245,77,0.24)",
        color: "#c8f26c",
      };
    case "pending":
    case "created":
      return {
        background: "rgba(241,199,109,0.12)",
        border: "rgba(241,199,109,0.24)",
        color: "#f1c76d",
      };
    case "failed":
    case "cancelled":
      return {
        background: "rgba(248,113,113,0.12)",
        border: "rgba(248,113,113,0.24)",
        color: "#fca5a5",
      };
    default:
      return {
        background: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.08)",
        color: "#d6d0c4",
      };
  }
}

export function getBillingAccessSummary(overview: BillingOverview) {
  const { entitlements, latestOrder } = overview;

  if ((latestOrder?.status === "pending" || latestOrder?.status === "created") && entitlements.plan === "free") {
    return `Your ${formatPlanName(latestOrder.plan)} payment is waiting for confirmation. Access should update automatically.`;
  }

  if (entitlements.plan === "lifetime") {
    return "Lifetime access is active. Every export is unlocked with no expiry.";
  }

  if (entitlements.plan === "pro" && entitlements.planExpiresAt) {
    return `Pro access is active until ${formatBillingDate(entitlements.planExpiresAt)}.`;
  }

  if (entitlements.accessStatus === "expired") {
    if (latestOrder?.accessEndsAt) {
      return `Your ${formatPlanName(latestOrder.plan)} access ended on ${formatBillingDate(latestOrder.accessEndsAt)}.`;
    }

    return "Your paid access has ended. Renew Pro or switch to Lifetime.";
  }

  return getPlanDetail(entitlements);
}

export function getBillingWindowSummary(overview: BillingOverview) {
  const { entitlements, latestOrder } = overview;

  if (entitlements.plan === "lifetime") {
    return "No expiry";
  }

  if (entitlements.plan === "pro" && entitlements.planExpiresAt) {
    return `Ends ${formatBillingDate(entitlements.planExpiresAt)}`;
  }

  if (entitlements.accessStatus === "expired" && latestOrder?.accessEndsAt) {
    return `Ended ${formatBillingDate(latestOrder.accessEndsAt)}`;
  }

  if (latestOrder?.status === "pending" || latestOrder?.status === "created") {
    return "Waiting for webhook confirmation";
  }

  return "Monthly free limit resets automatically";
}

export function getLatestPaymentSummary(overview: BillingOverview) {
  const order = overview.latestOrder;

  if (!order) {
    return "No payment history yet";
  }

  const amount = formatBillingAmountPaise(order.amountPaise);
  return `${amount} ${formatPlanName(order.plan)}`;
}

export function getLatestPaymentMeta(overview: BillingOverview) {
  const order = overview.latestOrder;

  if (!order) {
    return "Start free and upgrade when you need clean exports.";
  }

  if (order.status === "paid") {
    if (order.billingInterval === "lifetime") {
      return `Paid on ${formatBillingDate(order.paidAt || order.createdAt)}.`;
    }

    if (order.accessEndsAt) {
      return `Access window ends ${formatBillingDate(order.accessEndsAt)}.`;
    }

    return `Paid on ${formatBillingDate(order.paidAt || order.createdAt)}.`;
  }

  if (order.status === "pending" || order.status === "created") {
    return `Started on ${formatBillingDate(order.createdAt)}. We'll update access automatically.`;
  }

  return `Last attempt was ${getOrderStatusLabel(order.status).toLowerCase()} on ${formatBillingDate(order.createdAt)}.`;
}
