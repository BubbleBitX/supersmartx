import { NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { getProfileByUserId, upsertProfileForUser } from "@/lib/server/profile-repository";
import { getEmptyProfile, type UserProfile } from "@/lib/profile";

function sanitizeProfile(input: Partial<UserProfile>): UserProfile {
  const base = getEmptyProfile();

  return {
    ...base,
    ...input,
    social: {
      ...base.social,
      ...(input.social || {}),
    },
  };
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const profile = await getProfileByUserId(user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const body = (await request.json()) as Partial<UserProfile>;
    const profile = await upsertProfileForUser(user.id, sanitizeProfile(body));

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}
