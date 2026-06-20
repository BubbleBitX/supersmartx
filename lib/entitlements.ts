import type { Theme } from "@/lib/templates";

export type EffectivePlan = "free" | "pro" | "lifetime";
export type AccessStatus = "free" | "active" | "expired";

export interface AppEntitlements {
  plan: EffectivePlan;
  accessStatus: AccessStatus;
  planExpiresAt: string | null;
  downloadsUsedThisPeriod: number;
  downloadsRemaining: number | null;
  features: {
    watermark: boolean;
    allowedThemes: Theme[];
  };
}

export const FREE_THEME_KEYS: Theme[] = ["dark", "light", "startup"];
export const PAID_THEME_KEYS: Theme[] = ["dark", "light", "premium", "startup", "corporate", "modern"];

export function getDefaultEntitlements(): AppEntitlements {
  return {
    plan: "free",
    accessStatus: "free",
    planExpiresAt: null,
    downloadsUsedThisPeriod: 0,
    downloadsRemaining: 5,
    features: {
      watermark: true,
      allowedThemes: FREE_THEME_KEYS,
    },
  };
}

export async function fetchEntitlements(): Promise<AppEntitlements> {
  const response = await fetch("/api/account/entitlements", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return getDefaultEntitlements();
  }

  if (!response.ok) {
    throw new Error("Failed to load entitlements.");
  }

  const payload = (await response.json()) as { entitlements: AppEntitlements };
  return payload.entitlements;
}
