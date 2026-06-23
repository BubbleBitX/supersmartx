import fs from "node:fs";
import path from "node:path";

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return { rawText: "", values: {} };
  }

  const rawText = fs.readFileSync(filePath, "utf8");
  const values = {};

  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
    values[key] = value;
  }

  return { rawText, values };
}

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isEnabled(value) {
  return String(value).toLowerCase() === "true";
}

function isLocalUrl(value) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value);
}

const envFile = parseDotEnv(path.join(process.cwd(), ".env"));
const env = { ...envFile.values, ...process.env };

const failures = [];
const warnings = [];

const requiredVars = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of requiredVars) {
  if (!hasValue(env[key])) {
    failures.push(`Missing required env: ${key}`);
  }
}

const appUrl = env.NEXT_PUBLIC_APP_URL || "";
if (hasValue(appUrl)) {
  if (!/^https:\/\//i.test(appUrl)) {
    failures.push("NEXT_PUBLIC_APP_URL must use https in production.");
  }

  if (isLocalUrl(appUrl)) {
    failures.push("NEXT_PUBLIC_APP_URL cannot point to localhost for production.");
  }
}

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
const hasBaselineMigration = fs.existsSync(migrationsDir)
  && fs.readdirSync(migrationsDir, { withFileTypes: true }).some((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }

    return fs.existsSync(path.join(migrationsDir, entry.name, "migration.sql"));
  });

if (!hasBaselineMigration) {
  failures.push("No Prisma migration files found under prisma/migrations.");
}

if (isEnabled(env.ENABLE_PAYMENTS)) {
  for (const key of ["CASHFREE_APP_ID", "CASHFREE_SECRET_KEY", "CASHFREE_ENV", "CASHFREE_API_VERSION"]) {
    if (!hasValue(env[key])) {
      failures.push(`Payments enabled but ${key} is missing.`);
    }
  }

  if (env.CASHFREE_ENV !== "production") {
    failures.push("ENABLE_PAYMENTS=true requires CASHFREE_ENV=production for live launch.");
  }
}

if (isEnabled(env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH) && !hasValue(env.NEXT_PUBLIC_SUPABASE_URL)) {
  failures.push("Google auth is enabled but Supabase URL is missing.");
}

if (isEnabled(env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH)) {
  warnings.push("GitHub OAuth is enabled in the UI. Confirm the provider is configured in Supabase before launch.");
}

if (hasValue(env.NEXT_PUBLIC_POSTHOG_KEY) && env.NEXT_PUBLIC_POSTHOG_KEY === "phc_...") {
  warnings.push("PostHog key is still using the example value.");
}

if (isEnabled(env.ENABLE_TRANSACTIONAL_EMAIL)) {
  if (!hasValue(env.RESEND_API_KEY) || env.RESEND_API_KEY === "re_...") {
    failures.push("Transactional email is enabled but RESEND_API_KEY is missing or still an example value.");
  }
}

if (/^(DATABASE_URL|DIRECT_URL)="/m.test(envFile.rawText)) {
  warnings.push("Quoted database URLs can break direct Prisma CLI commands. Prefer unquoted values in hosted environments.");
}

console.log("SuperSmartX launch validation");
console.log(`Failures: ${failures.length}`);
console.log(`Warnings: ${warnings.length}`);

if (failures.length > 0) {
  console.log("\nBlocking issues:");
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }
}

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (failures.length === 0) {
  console.log("\nLaunch validator passed.");
}

process.exit(failures.length === 0 ? 0 : 1);
