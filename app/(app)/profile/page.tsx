import { requireAuthenticatedPage } from "@/lib/server/auth";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  await requireAuthenticatedPage("/profile");
  return <ProfilePageClient />;
}
