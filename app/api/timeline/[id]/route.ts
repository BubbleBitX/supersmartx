import { NextResponse } from "next/server";
import { requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { deleteTimelineEventForUser } from "@/lib/server/timeline-repository";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;

    await deleteTimelineEventForUser(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to delete timeline event." }, { status: 500 });
  }
}
