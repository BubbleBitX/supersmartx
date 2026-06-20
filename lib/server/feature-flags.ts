export function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function isLocalUrl(value: string) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value);
}

export function paymentsConfigured() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    hasValue(appUrl) &&
    hasValue(process.env.CASHFREE_APP_ID) &&
    hasValue(process.env.CASHFREE_SECRET_KEY) &&
    hasValue(process.env.CASHFREE_ENV) &&
    hasValue(process.env.CASHFREE_API_VERSION)
  );
}

export function paymentsProductionReady() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return paymentsConfigured() && !!appUrl && !isLocalUrl(appUrl) && /^https:\/\//i.test(appUrl);
}

export function paymentsEnabled() {
  return process.env.ENABLE_PAYMENTS === "true" && paymentsProductionReady();
}

export function transactionalEmailEnabled() {
  return process.env.ENABLE_TRANSACTIONAL_EMAIL === "true";
}
