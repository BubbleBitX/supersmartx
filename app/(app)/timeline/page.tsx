"use client";
import { useEffect, useState } from "react";
import { loadTimeline, deleteFromTimeline, groupByYear, TimelineEvent, TIMELINE_UPDATED_EVENT } from "@/lib/timeline";
import { EVENT_CATEGORIES } from "@/lib/events/categories";
import Link from "next/link";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const refresh = () => setEvents(loadTimeline());
    refresh();
    window.addEventListener(TIMELINE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(TIMELINE_UPDATED_EVENT, refresh);
  }, []);

  const handleDelete = (id: string) => {
    deleteFromTimeline(id);
    setEvents(e => e.filter(ev => ev.id !== id));
  };

  const filtered = filterCategory === "all"
    ? events
    : events.filter(e => e.category === filterCategory);

  const grouped = groupByYear(filtered);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div style={{ padding: "28px 32px", maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            My Timeline
          </h1>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            {events.length} event{events.length !== 1 ? "s" : ""} — your professional journey
          </p>
        </div>
        <Link href="/create" style={{
          padding: "8px 16px", background: "linear-gradient(135deg,#a3e635,#84cc16)",
          color: "#000", fontSize: "12px", fontWeight: 700,
          borderRadius: "8px", textDecoration: "none",
        }}>
          ✦ Add Event
        </Link>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
        <button onClick={() => setFilterCategory("all")} style={{
          padding: "4px 12px", fontSize: "11px", borderRadius: "20px", cursor: "pointer",
          background: filterCategory === "all" ? "#a3e635" : "#161616",
          color: filterCategory === "all" ? "#000" : "#666",
          border: `1px solid ${filterCategory === "all" ? "#a3e635" : "#252525"}`,
          fontWeight: filterCategory === "all" ? 700 : 400,
        }}>All</button>
        {EVENT_CATEGORIES.filter(c => events.some(e => e.category === c.slug)).map(cat => (
          <button key={cat.slug} onClick={() => setFilterCategory(cat.slug)} style={{
            padding: "4px 12px", fontSize: "11px", borderRadius: "20px", cursor: "pointer",
            background: filterCategory === cat.slug ? cat.color : "#161616",
            color: filterCategory === cat.slug ? "#000" : "#666",
            border: `1px solid ${filterCategory === cat.slug ? cat.color : "#252525"}`,
            fontWeight: filterCategory === cat.slug ? 700 : 400,
          }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 0",
          border: "1px dashed #1e1e1e", borderRadius: "16px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.2 }}>◎</div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>Your timeline is empty</div>
          <div style={{ fontSize: "13px", color: "#333", marginTop: "6px", marginBottom: "20px" }}>
            Every event you create will appear here as your professional journey
          </div>
          <Link href="/create" style={{
            padding: "10px 20px", background: "#a3e635", color: "#000",
            fontSize: "13px", fontWeight: 700, borderRadius: "8px", textDecoration: "none",
          }}>Create First Event</Link>
        </div>
      ) : (
        years.map(year => (
          <div key={year} style={{ marginBottom: "36px" }}>
            {/* Year divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#666", letterSpacing: "1px" }}>{year}</div>
              <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
              <div style={{ fontSize: "10px", color: "#444" }}>{grouped[year].length} events</div>
            </div>

            {/* Events */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {grouped[year].map(ev => (
                <div key={ev.id} style={{
                  background: "#111", border: "1px solid #1a1a1a",
                  borderRadius: "12px", padding: "16px 18px",
                  display: "flex", alignItems: "center", gap: "14px",
                  borderLeft: `3px solid ${ev.categoryColor}`,
                }}>
                  <div style={{ fontSize: "24px", flexShrink: 0 }}>{ev.eventTypeIcon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0", marginBottom: "3px" }}>
                      {ev.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "9px", padding: "2px 7px", borderRadius: "4px",
                        background: ev.categoryColor + "20", color: ev.categoryColor, fontWeight: 700,
                      }}>
                        {ev.category}
                      </span>
                      {ev.platforms.map(p => (
                        <span key={p} style={{ fontSize: "9px", color: "#444" }}>{p}</span>
                      ))}
                      <span style={{ fontSize: "10px", color: "#444", marginLeft: "auto" }}>
                        {new Date(ev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} style={{
                    fontSize: "10px", color: "#555", background: "transparent",
                    padding: "4px 8px", border: "1px solid #1e1e1e", borderRadius: "5px", cursor: "pointer",
                    flexShrink: 0,
                  }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
