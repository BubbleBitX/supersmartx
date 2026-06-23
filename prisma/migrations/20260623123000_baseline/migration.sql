-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'pro', 'lifetime');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('cashfree');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'paid', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('none', 'days30', 'lifetime');

-- CreateEnum
CREATE TYPE "AccessGrantStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "UsageEventKind" AS ENUM ('export_download');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('received', 'processed', 'ignored', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "plan_expires_at" TIMESTAMP(3),
    "downloads_this_month" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "headline" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "photo_url" TEXT,
    "logo_url" TEXT,
    "brand_color" TEXT NOT NULL DEFAULT '#a3e635',
    "brand_theme" TEXT NOT NULL DEFAULT 'dark',
    "social" JSONB NOT NULL DEFAULT '{}',
    "setup_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_generations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type_id" TEXT NOT NULL,
    "event_type_label" TEXT NOT NULL,
    "event_type_icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "category_color" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "platforms" JSONB NOT NULL,
    "captions" JSONB NOT NULL,
    "image_data_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'cashfree',
    "product_key" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL,
    "billing_interval" "BillingInterval" NOT NULL DEFAULT 'none',
    "provider_order_id" TEXT NOT NULL,
    "cf_order_id" TEXT,
    "payment_session_id" TEXT,
    "amount_paise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'created',
    "provider_payload" JSONB NOT NULL DEFAULT '{}',
    "access_starts_at" TIMESTAMP(3),
    "access_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_grants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'cashfree',
    "product_key" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL,
    "billing_interval" "BillingInterval" NOT NULL,
    "status" "AccessGrantStatus" NOT NULL DEFAULT 'active',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_events" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "UsageEventKind" NOT NULL,
    "period_key" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'cashfree',
    "provider_event_id" TEXT,
    "event_hash" TEXT NOT NULL,
    "provider_order_id" TEXT,
    "payment_status" TEXT,
    "processing_status" "WebhookProcessingStatus" NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "error_message" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "saved_generations_user_id_created_at_idx" ON "saved_generations"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_provider_order_id_key" ON "payment_orders"("provider_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_cf_order_id_key" ON "payment_orders"("cf_order_id");

-- CreateIndex
CREATE INDEX "payment_orders_user_id_created_at_idx" ON "payment_orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payment_orders_status_created_at_idx" ON "payment_orders"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "access_grants_order_id_key" ON "access_grants"("order_id");

-- CreateIndex
CREATE INDEX "access_grants_user_id_status_ends_at_idx" ON "access_grants"("user_id", "status", "ends_at" DESC);

-- CreateIndex
CREATE INDEX "usage_events_user_id_kind_period_key_created_at_idx" ON "usage_events"("user_id", "kind", "period_key", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_event_id_key" ON "webhook_events"("provider_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_event_hash_key" ON "webhook_events"("event_hash");

-- CreateIndex
CREATE INDEX "webhook_events_provider_order_id_received_at_idx" ON "webhook_events"("provider_order_id", "received_at" DESC);

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_generations" ADD CONSTRAINT "saved_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "payment_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

