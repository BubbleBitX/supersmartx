import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TimelineEvent } from "@/lib/timeline";

function parseStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseStringMap(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function mapSavedGeneration(record: {
  id: string;
  eventTypeId: string;
  eventTypeLabel: string;
  eventTypeIcon: string;
  category: string;
  categoryColor: string;
  title: string;
  values: Prisma.JsonValue;
  platforms: Prisma.JsonValue;
  captions: Prisma.JsonValue;
  imageDataUrl: string | null;
  createdAt: Date;
}): TimelineEvent {
  return {
    id: record.id,
    eventTypeId: record.eventTypeId,
    eventTypeLabel: record.eventTypeLabel,
    eventTypeIcon: record.eventTypeIcon,
    category: record.category,
    categoryColor: record.categoryColor,
    title: record.title,
    values: parseStringMap(record.values),
    platforms: parseStringArray(record.platforms),
    captions: parseStringMap(record.captions),
    imageDataUrl: record.imageDataUrl ?? undefined,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function listTimelineForUser(userId: string) {
  const records = await prisma.savedGeneration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapSavedGeneration);
}

export async function saveTimelineEventForUser(userId: string, event: TimelineEvent) {
  const record = await prisma.savedGeneration.create({
    data: {
      userId,
      eventTypeId: event.eventTypeId,
      eventTypeLabel: event.eventTypeLabel,
      eventTypeIcon: event.eventTypeIcon,
      category: event.category,
      categoryColor: event.categoryColor,
      title: event.title,
      values: event.values,
      platforms: event.platforms,
      captions: event.captions,
      imageDataUrl: event.imageDataUrl ?? null,
    },
  });

  return mapSavedGeneration(record);
}

export async function deleteTimelineEventForUser(userId: string, id: string) {
  await prisma.savedGeneration.deleteMany({
    where: { id, userId },
  });
}

