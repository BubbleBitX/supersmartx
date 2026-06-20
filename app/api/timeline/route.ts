import { NextResponse } from "next/server";
import { ensureDatabaseUser, requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { listTimelineForUser, saveTimelineEventForUser } from "@/lib/server/timeline-repository";
import type { TimelineEvent } from "@/lib/timeline";

function sanitizeTimelineEvent(input: TimelineEvent): TimelineEvent {
  return {
    id: input.id || "",
    eventTypeId: input.eventTypeId || "",
    eventTypeLabel: input.eventTypeLabel || "",
    eventTypeIcon: input.eventTypeIcon || "",
    category: input.category || "",
    categoryColor: input.categoryColor || "",
    title: input.title || "",
    values: input.values || {},
    platforms: Array.isArray(input.platforms) ? input.platforms : [],
    captions: input.captions || {},
    imageDataUrl: input.imageDataUrl,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const timeline = await listTimelineForUser(user.id);
    return NextResponse.json({ timeline });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to load timeline." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await ensureDatabaseUser(user);

    const body = (await request.json()) as TimelineEvent;
    const event = await saveTimelineEventForUser(user.id, sanitizeTimelineEvent(body));
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to save timeline event." }, { status: 500 });
  }
}
