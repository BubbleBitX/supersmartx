"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, UserProfile, profileCompletionSteps } from "@/lib/profile";
import { loadTimeline, TimelineEvent, TIMELINE_UPDATED_EVENT } from "@/lib/timeline";
import { EVENT_CATEGORIES } from "@/lib/events/categories";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadProfile());
      setTimeline(loadTimeline());
    };
    refresh();
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener(TIMELINE_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener(TIMELINE_UPDATED_EVENT, refresh);
    };
  }, []);

  const steps = profileCompletionSteps(profile);
  const completedSteps = steps.filter(s => s.done).length;
  const pct = Math.round((completedSteps / steps.length) * 100);
  const recent = timeline.slice(0, 4);
  const isNew = !profile.name;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  const thisMonthCount = timeline.filter(e => new Date(e.createdAt) > cutoffDate).length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px" }}>

      {/* Welcome header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          {isNew ? "Welcome to SuperSmartX" : `Welcome back${profile.name ? `, ${profile.name.split(" ")[0]}` : ""}!`}
        </h1>
        <p style={{ fontSize: "14px", color: "#555", margin: 0 }}>
          What would you like to share today?
        </p>
      </div>

      {/* Profile incomplete banner */}
      {pct < 100 && (
        <div style={{
          background: "#111", border: "1px solid #1e1e1e",
          borderLeft: "3px solid #a3e635",
          borderRadius: "10px", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "24px",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "2px" }}>
              Complete your profile - {pct}% done
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {steps.find(s => !s.done)?.label} to auto-fill future events
            </div>
          </div>
          <Link href="/profile" style={{
            padding: "7px 14px", background: "#a3e635", color: "#000",
            fontSize: "12px", fontWeight: 700, borderRadius: "7px", textDecoration: "none",
          }}>
            Complete →
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Total Events",  value: timeline.length,                                                         icon: "◎" },
          { label: "This Month",    value: thisMonthCount, icon: "◷" },
          { label: "Platforms Used",value: new Set(timeline.flatMap(e => e.platforms)).size,                        icon: "◈" },
          { label: "Categories",    value: new Set(timeline.map(e => e.category)).size,                             icon: "◉" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#111", border: "1px solid #1a1a1a",
            borderRadius: "10px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "4px" }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#f0f0f0" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two column: event categories + recent timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Left: Start creating */}
        <div style={{
          background: "#111", border: "1px solid #1a1a1a",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "14px" }}>
            Create New Event
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {EVENT_CATEGORIES.slice(0, 8).map(cat => (
              <Link key={cat.slug} href={`/create?category=${cat.slug}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", borderRadius: "8px",
                background: "#161616", border: "1px solid #1e1e1e",
                textDecoration: "none", transition: "all 0.15s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = cat.color + "50";
                  (e.currentTarget as HTMLAnchorElement).style.background = "#1c1c1c";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e1e1e";
                  (e.currentTarget as HTMLAnchorElement).style.background = "#161616";
                }}
              >
                <span style={{ fontSize: "16px" }}>{cat.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#ccc" }}>{cat.label}</span>
              </Link>
            ))}
          </div>
          <Link href="/create" style={{
            display: "block", textAlign: "center", marginTop: "12px",
            padding: "10px", background: "linear-gradient(135deg, #a3e635, #84cc16)",
            color: "#000", fontSize: "12px", fontWeight: 700,
            borderRadius: "8px", textDecoration: "none",
          }}>
            Browse All Event Types
          </Link>
        </div>

        {/* Right: Recent timeline */}
        <div style={{
          background: "#111", border: "1px solid #1a1a1a",
          borderRadius: "12px", padding: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>
              Recent Events
            </div>
            {timeline.length > 0 && (
              <Link href="/timeline" style={{ fontSize: "11px", color: "#a3e635", textDecoration: "none" }}>
                View All →
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#333" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>◎</div>
              <div style={{ fontSize: "12px" }}>No events yet</div>
              <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "4px" }}>
                Create your first event to build your timeline
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recent.map(ev => (
                <div key={ev.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px",
                  background: "#161616", border: "1px solid #1e1e1e",
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{ev.eventTypeIcon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "12px", fontWeight: 600, color: "#e0e0e0",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
                      {ev.platforms.join(" · ")} ·{" "}
                      {new Date(ev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "9px", padding: "2px 7px", borderRadius: "4px",
                    background: ev.categoryColor + "20", color: ev.categoryColor,
                    fontWeight: 600, flexShrink: 0,
                  }}>
                    {ev.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
