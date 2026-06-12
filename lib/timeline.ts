// ─────────────────────────────────────────────────────────────────────────────
// EVENT TIMELINE — PRD §12
// Every generated event saved as a professional journey
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  eventTypeId: string;
  eventTypeLabel: string;
  eventTypeIcon: string;
  category: string;
  categoryColor: string;
  title: string;           // interpolated cardHeadline
  values: Record<string, string>;
  platforms: string[];     // which platforms were generated
  imageDataUrl?: string;
  captions: Record<string, string>; // platform -> caption
  createdAt: string;
}

const STORAGE_KEY = "g2o_timeline";
export const TIMELINE_UPDATED_EVENT = "g2o_timeline_updated";

export function loadTimeline(): TimelineEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveToTimeline(event: TimelineEvent): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadTimeline();
    const updated = [event, ...existing].slice(0, 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(TIMELINE_UPDATED_EVENT));
  } catch {}
}

export function deleteFromTimeline(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = loadTimeline().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(TIMELINE_UPDATED_EVENT));
  } catch {}
}

export function groupByYear(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  return events.reduce((acc, ev) => {
    const year = new Date(ev.createdAt).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(ev);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);
}
