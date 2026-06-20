import { NextResponse } from "next/server";
import { claimDownloadAccessForUser } from "@/lib/server/access";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const body = (await request.json()) as {
      format?: string;
      platform?: string | null;
      theme?: string;
    };

    if (!body.format || !body.theme) {
      return NextResponse.json({ error: "Format and theme are required." }, { status: 400 });
    }

    const result = await claimDownloadAccessForUser({
      format: body.format,
      platform: body.platform ?? null,
      theme: body.theme,
      userId: user.id,
    });

    if (!result.allowed) {
      return NextResponse.json(
        {
          code: result.code,
          entitlements: result.entitlements,
          error: "Free plan export limit reached for this month.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      code: result.code,
      entitlements: result.entitlements,
      ok: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to claim export access." }, { status: 500 });
  }
}
