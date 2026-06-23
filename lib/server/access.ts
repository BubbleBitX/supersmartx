import { AccessGrantStatus, BillingInterval, Prisma, UsageEventKind, UserPlan } from "@prisma/client";
import type { AppEntitlements, EffectivePlan, AccessStatus } from "@/lib/entitlements";
import { FREE_THEME_KEYS, PAID_THEME_KEYS } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

const FREE_DOWNLOAD_LIMIT = 5;

function getCurrentPeriodKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function sameDate(a: Date | null | undefined, b: Date | null | undefined) {
  return (a?.toISOString() ?? null) === (b?.toISOString() ?? null);
}

function buildEntitlements(input: {
  accessStatus: AccessStatus;
  downloadsUsedThisPeriod: number;
  plan: EffectivePlan;
  planExpiresAt: Date | null;
}): AppEntitlements {
  const paid = input.plan === "pro" || input.plan === "lifetime";
  const downloadsRemaining = paid ? null : Math.max(0, FREE_DOWNLOAD_LIMIT - input.downloadsUsedThisPeriod);

  return {
    plan: input.plan,
    accessStatus: input.accessStatus,
    planExpiresAt: input.planExpiresAt ? input.planExpiresAt.toISOString() : null,
    downloadsUsedThisPeriod: input.downloadsUsedThisPeriod,
    downloadsRemaining,
    features: {
      watermark: !paid,
      allowedThemes: paid ? PAID_THEME_KEYS : FREE_THEME_KEYS,
    },
  };
}

async function syncUserAccessState(userId: string) {
  const now = new Date();

  await prisma.accessGrant.updateMany({
    where: {
      userId,
      status: AccessGrantStatus.active,
      endsAt: { lt: now },
    },
    data: { status: AccessGrantStatus.expired },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiresAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const grants = await prisma.accessGrant.findMany({
    where: {
      userId,
      status: AccessGrantStatus.active,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: {
      plan: true,
      endsAt: true,
    },
    orderBy: [{ endsAt: "desc" }, { createdAt: "desc" }],
  });

  const latestGrant = await prisma.accessGrant.findFirst({
    where: { userId },
    select: {
      plan: true,
      status: true,
      endsAt: true,
    },
    orderBy: [{ endsAt: "desc" }, { createdAt: "desc" }],
  });

  let effectivePlan: EffectivePlan = "free";
  let planExpiresAt: Date | null = null;
  let accessStatus: AccessStatus = "free";

  const lifetimeGrant = grants.find((grant) => grant.plan === UserPlan.lifetime && grant.endsAt === null);
  if (lifetimeGrant) {
    effectivePlan = "lifetime";
    accessStatus = "active";
  } else {
    const activeProGrant = grants.find((grant) => grant.plan === UserPlan.pro && grant.endsAt && grant.endsAt > now);
    if (activeProGrant?.endsAt) {
      effectivePlan = "pro";
      planExpiresAt = activeProGrant.endsAt;
      accessStatus = "active";
    } else if (latestGrant && latestGrant.plan !== UserPlan.free && latestGrant.status !== AccessGrantStatus.active) {
      accessStatus = "expired";
    }
  }

  if (user.plan !== effectivePlan || !sameDate(user.planExpiresAt, planExpiresAt)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: effectivePlan,
        planExpiresAt,
      },
    });
  }

  return { accessStatus, plan: effectivePlan, planExpiresAt };
}

async function getDownloadUsageForCurrentPeriod(userId: string) {
  const periodKey = getCurrentPeriodKey();
  const count = await prisma.usageEvent.count({
    where: {
      userId,
      kind: UsageEventKind.export_download,
      periodKey,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { downloadsThisMonth: count },
  });

  return { count, periodKey };
}

export async function getUserEntitlements(userId: string) {
  const access = await syncUserAccessState(userId);
  const usage = await getDownloadUsageForCurrentPeriod(userId);

  return buildEntitlements({
    accessStatus: access.accessStatus,
    plan: access.plan,
    planExpiresAt: access.planExpiresAt,
    downloadsUsedThisPeriod: usage.count,
  });
}

export async function claimDownloadAccessForUser(input: {
  format: string;
  platform: string | null;
  theme: string;
  userId: string;
}) {
  const entitlements = await getUserEntitlements(input.userId);

  if (entitlements.plan === "free" && (entitlements.downloadsRemaining ?? 0) <= 0) {
    return {
      allowed: false,
      code: "FREE_LIMIT_REACHED" as const,
      entitlements,
    };
  }

  const periodKey = getCurrentPeriodKey();

  await prisma.usageEvent.create({
    data: {
      userId: input.userId,
      kind: UsageEventKind.export_download,
      periodKey,
      metadata: {
        format: input.format,
        platform: input.platform,
        theme: input.theme,
      } satisfies Prisma.InputJsonValue,
    },
  });

  const updatedEntitlements = await getUserEntitlements(input.userId);

  return {
    allowed: true,
    code: "OK" as const,
    entitlements: updatedEntitlements,
  };
}

export function getAccessWindow(input: {
  billingInterval: BillingInterval;
  paidAt?: Date;
}) {
  const startsAt = input.paidAt ?? new Date();

  if (input.billingInterval === BillingInterval.days30) {
    return {
      startsAt,
      endsAt: addDays(startsAt, 30),
    };
  }

  if (input.billingInterval === BillingInterval.lifetime) {
    return {
      startsAt,
      endsAt: null,
    };
  }

  return {
    startsAt,
    endsAt: null,
  };
}
