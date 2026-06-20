export interface TimelineEvent {
  id: string;
  eventTypeId: string;
  eventTypeLabel: string;
  eventTypeIcon: string;
  category: string;
  categoryColor: string;
  title: string;
  values: Record<string, string>;
  platforms: string[];
  imageDataUrl?: string;
  captions: Record<string, string>;
  createdAt: string;
}

export const TIMELINE_UPDATED_EVENT = "ssx_timeline_updated";

export async function fetchTimeline(): Promise<TimelineEvent[]> {
  const response = await fetch("/api/timeline", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to load timeline.");
  }

  const payload = (await response.json()) as { timeline: TimelineEvent[] };
  return payload.timeline;
}

export async function saveToTimeline(event: TimelineEvent): Promise<TimelineEvent> {
  const response = await fetch("/api/timeline", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error("Failed to save timeline event.");
  }

  const payload = (await response.json()) as { event: TimelineEvent };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TIMELINE_UPDATED_EVENT));
  }

  return payload.event;
}

export async function deleteFromTimeline(id: string): Promise<void> {
  const response = await fetch(`/api/timeline/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete timeline event.");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TIMELINE_UPDATED_EVENT));
  }
}

export function groupByYear(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  return events.reduce((acc, ev) => {
    const year = new Date(ev.createdAt).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(ev);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);
}
