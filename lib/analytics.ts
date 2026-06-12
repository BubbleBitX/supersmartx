/**
 * PostHog analytics wrapper.
 * Install: npm install posthog-js
 * Then add NEXT_PUBLIC_POSTHOG_KEY to .env.local
 *
 * Usage:
 *   import { track } from "@/lib/analytics";
 *   track("generate_clicked", { template: "hackathon-selected" });
 */

type EventName =
  | "template_viewed"
  | "generate_clicked"
  | "download_clicked"
  | "copy_caption_clicked"
  | "post_linkedin_clicked"
  | "payment_started"
  | "payment_completed";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: EventProps) => void;
      identify: (id: string, props?: EventProps) => void;
    };
  }
}

export function track(event: EventName, props?: EventProps) {
  if (typeof window === "undefined") return;
  if (window.posthog) {
    window.posthog.capture(event, props);
  }
  // Fallback: console log in dev
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, props);
  }
}

export function identify(userId: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  if (window.posthog) {
    window.posthog.identify(userId, props);
  }
}
