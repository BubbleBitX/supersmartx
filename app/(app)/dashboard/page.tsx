import { requireAuthenticatedPage } from "@/lib/server/auth";
import DashboardPageClient from "./DashboardPageClient";

export default async function DashboardPage() {
  await requireAuthenticatedPage("/dashboard");
  return <DashboardPageClient />;
}
