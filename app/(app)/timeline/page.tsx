import { requireAuthenticatedPage } from "@/lib/server/auth";
import TimelinePageClient from "./TimelinePageClient";

export default async function TimelinePage() {
  await requireAuthenticatedPage("/timeline");
  return <TimelinePageClient />;
}
