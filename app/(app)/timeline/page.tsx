"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/events/categories";
import { deleteFromTimeline, fetchTimeline, groupByYear, TIMELINE_UPDATED_EVENT, type TimelineEvent } from "@/lib/timeline";

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const refresh = async () => {
      try {
        setEvents(await fetchTimeline());
      } catch (error) {
        console.error(error);
      }
    };

    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(TIMELINE_UPDATED_EVENT, handleRefresh);
    return () => window.removeEventListener(TIMELINE_UPDATED_EVENT, handleRefresh);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteFromTimeline(id);
      setEvents((current) => current.filter((event) => event.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = filterCategory === "all" ? events : events.filter((event) => event.category === filterCategory);
  const grouped = groupByYear(filtered);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div style={{ padding: "28px 32px", maxWidth: "980px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Saved Work
          </h1>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            {events.length} saved item{events.length !== 1 ? "s" : ""} ready to reuse, review, or clean up
          </p>
        </div>
        <Link href="/create" style={{ padding: "8px 16px", background: "linear-gradient(135deg,#a3e635,#84cc16)", color: "#000", fontSize: "12px", fontWeight: 700, borderRadius: "8px", textDecoration: "none" }}>
          Create New Post
        </Link>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
        <button onClick={() => setFilterCategory("all")} style={{ padding: "4px 12px", fontSize: "11px", borderRadius: "20px", cursor: "pointer", background: filterCategory === "all" ? "#a3e635" : "#161616", color: filterCategory === "all" ? "#000" : "#666", border: `1px solid ${filterCategory === "all" ? "#a3e635" : "#252525"}`, fontWeight: filterCategory === "all" ? 700 : 400 }}>
          All
        </button>
        {EVENT_CATEGORIES.filter((category) => events.some((event) => event.category === category.slug)).map((category) => (
          <button key={category.slug} onClick={() => setFilterCategory(category.slug)} style={{ padding: "4px 12px", fontSize: "11px", borderRadius: "20px", cursor: "pointer", background: filterCategory === category.slug ? category.color : "#161616", color: filterCategory === category.slug ? "#000" : "#666", border: `1px solid ${filterCategory === category.slug ? category.color : "#252525"}`, fontWeight: filterCategory === category.slug ? 700 : 400 }}>
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", border: "1px dashed #1e1e1e", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", opacity: 0.6 }}>
            <EmptyStateGlyph />
          </div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>No saved work yet</div>
          <div style={{ fontSize: "13px", color: "#333", marginTop: "6px", marginBottom: "20px" }}>
            Every generated post will land here so you can reuse the setup later.
          </div>
          <Link href="/create" style={{ padding: "10px 20px", background: "#a3e635", color: "#000", fontSize: "13px", fontWeight: 700, borderRadius: "8px", textDecoration: "none" }}>
            Create First Post
          </Link>
        </div>
      ) : (
        years.map((year) => (
          <div key={year} style={{ marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#666", letterSpacing: "1px" }}>{year}</div>
              <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
              <div style={{ fontSize: "10px", color: "#444" }}>{grouped[year].length} items</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {grouped[year].map((event) => {
                const category = EVENT_CATEGORIES.find((item) => item.slug === event.category);

                return (
                  <div key={event.id} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", borderLeft: `3px solid ${event.categoryColor}` }}>
                    <div style={{ fontSize: "24px", flexShrink: 0 }}>{event.eventTypeIcon}</div>

                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0", marginBottom: "3px" }}>{event.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "4px", background: event.categoryColor + "20", color: event.categoryColor, fontWeight: 700 }}>
                          {category?.label || event.category}
                        </span>
                        {event.platforms.map((platform) => (
                          <span key={platform} style={{ fontSize: "9px", color: "#444" }}>{platform}</span>
                        ))}
                        <span style={{ fontSize: "10px", color: "#444" }}>
                          {new Date(event.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginLeft: "auto", flexShrink: 0 }}>
                      <Link href={`/create?reuse=${encodeURIComponent(event.id)}`} style={{ fontSize: "10px", color: "#a3e635", background: "#141414", padding: "5px 10px", border: "1px solid #304217", borderRadius: "6px", textDecoration: "none", fontWeight: 700 }}>
                        Reuse
                      </Link>
                      <button onClick={() => void handleDelete(event.id)} style={{ fontSize: "10px", color: "#555", background: "transparent", padding: "5px 10px", border: "1px solid #1e1e1e", borderRadius: "6px", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function EmptyStateGlyph() {
  return (
    <span style={{ width: "40px", height: "40px", borderRadius: "14px", border: "1px dashed #2b2b2b", display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <span style={{ width: "18px", height: "2px", borderRadius: "999px", background: "#353535", position: "absolute", top: "12px" }} />
      <span style={{ width: "22px", height: "2px", borderRadius: "999px", background: "#353535" }} />
      <span style={{ width: "14px", height: "2px", borderRadius: "999px", background: "#353535", position: "absolute", bottom: "12px" }} />
    </span>
  );
}
