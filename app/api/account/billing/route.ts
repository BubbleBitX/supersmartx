import { NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { getBillingOverviewForUser } from "@/lib/server/billing-overview";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const overview = await getBillingOverviewForUser(user.id);
    return NextResponse.json({ overview });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to load billing overview." }, { status: 500 });
  }
}
