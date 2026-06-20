import { NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { getUserEntitlements } from "@/lib/server/access";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const entitlements = await getUserEntitlements(user.id);
    return NextResponse.json({ entitlements });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to load entitlements." }, { status: 500 });
  }
}
