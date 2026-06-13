"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/events/categories";
import { getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, profileCompletionSteps, UserProfile } from "@/lib/profile";
import { loadTimeline, TimelineEvent, TIMELINE_UPDATED_EVENT } from "@/lib/timeline";

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
  const completedSteps = steps.filter((step) => step.done).length;
  const pct = Math.round((completedSteps / steps.length) * 100);
  const recent = timeline.slice(0, 4);
  const firstName = profile.name.split(" ").filter(Boolean)[0];
  const isNew = !profile.name;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  const thisMonthCount = timeline.filter((event) => new Date(event.createdAt) > cutoffDate).length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1080px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          {isNew ? "Welcome to SuperSmartX" : `Welcome back${firstName ? `, ${firstName}` : ""}`}
        </h1>
        <p style={{ fontSize: "14px", color: "#555", margin: 0 }}>
          Create from one clear hub, then keep every draft and final output in saved work.
        </p>
      </div>

      {pct < 100 && (
        <div style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderLeft: "3px solid #a3e635",
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "2px" }}>
              Complete your brand profile - {pct}% done
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {steps.find((step) => !step.done)?.label} to improve autofill, previews, and output quality
            </div>
          </div>
          <Link href="/profile" style={{
            padding: "7px 14px",
            background: "#a3e635",
            color: "#000",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "7px",
            textDecoration: "none",
          }}>
            Complete Brand Profile
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Saved Items", value: timeline.length, icon: "stack" },
          { label: "This Month", value: thisMonthCount, icon: "pulse" },
          { label: "Platforms Used", value: new Set(timeline.flatMap((event) => event.platforms)).size, icon: "nodes" },
          { label: "Categories", value: new Set(timeline.map((event) => event.category)).size, icon: "rings" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#111",
            border: "1px solid #1a1a1a",
            borderRadius: "10px",
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11px", color: "#555", marginBottom: "4px" }}>
              <MetricGlyph kind={stat.icon} />
              <span>{stat.label}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#f0f0f0" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        <div style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "12px",
          padding: "20px",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>
            Create Hub
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0", marginBottom: "6px" }}>
            Start from one place
          </div>
          <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, marginBottom: "16px" }}>
            Use Create for manual flows, templates, platform-aware sizing, and final post preview.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            <Link href="/create" style={{
              textDecoration: "none",
              background: "linear-gradient(180deg, rgba(163,230,53,0.10) 0%, #141414 100%)",
              border: "1px solid #314415",
              borderRadius: "10px",
              padding: "14px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "6px" }}>Manual Start</div>
              <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.5 }}>
                Choose category, event type, platforms, and details from scratch.
              </div>
            </Link>
            <Link href="/templates" style={{
              textDecoration: "none",
              background: "#141414",
              border: "1px solid #1e1e1e",
              borderRadius: "10px",
              padding: "14px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "6px" }}>Fast Template Start</div>
              <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.5 }}>
                Jump into a structured format when you already know the post style.
              </div>
            </Link>
          </div>

          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>
            Quick Shortcuts
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
            {EVENT_CATEGORIES.slice(0, 6).map((category) => (
              <Link key={category.slug} href={`/create?category=${category.slug}`} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#161616",
                border: "1px solid #1e1e1e",
                textDecoration: "none",
              }}>
                <span style={{ fontSize: "16px" }}>{category.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#ccc" }}>{category.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "12px",
          padding: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>
              Recent Saved Work
            </div>
            {timeline.length > 0 && (
              <Link href="/timeline" style={{ fontSize: "11px", color: "#a3e635", textDecoration: "none" }}>
                Open Saved Work
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#333" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                <EmptyStateGlyph />
              </div>
              <div style={{ fontSize: "12px" }}>No saved work yet</div>
              <div style={{ fontSize: "11px", color: "#2a2a2a", marginTop: "4px" }}>
                Generate your first post to create a reusable history.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recent.map((event) => (
                <div key={event.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#161616",
                  border: "1px solid #1e1e1e",
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{event.eventTypeIcon}</span>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#e0e0e0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
                      {event.platforms.join(" / ")} / {new Date(event.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <Link href={`/create?reuse=${encodeURIComponent(event.id)}`} style={{
                    fontSize: "10px",
                    color: "#a3e635",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}>
                    Reuse
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricGlyph({ kind }: { kind: string }) {
  if (kind === "stack") {
    return (
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {[0, 1, 2].map((item) => (
          <span key={item} style={{ width: "10px", height: "2px", borderRadius: "999px", background: "#666" }} />
        ))}
      </span>
    );
  }

  if (kind === "pulse") {
    return (
      <span style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "10px" }}>
        <span style={{ width: "2px", height: "4px", borderRadius: "999px", background: "#666" }} />
        <span style={{ width: "2px", height: "8px", borderRadius: "999px", background: "#666" }} />
        <span style={{ width: "2px", height: "6px", borderRadius: "999px", background: "#666" }} />
      </span>
    );
  }

  if (kind === "nodes") {
    return (
      <span style={{ position: "relative", width: "12px", height: "10px", display: "inline-block" }}>
        <span style={{ position: "absolute", left: "1px", top: "4px", width: "10px", height: "1.5px", background: "#666" }} />
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            style={{
              position: "absolute",
              left: `${item * 4}px`,
              top: "2px",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: "#666",
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span style={{ position: "relative", width: "12px", height: "12px", display: "inline-block" }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid #666" }} />
      <span style={{ position: "absolute", inset: "3px", borderRadius: "50%", border: "1.5px solid #666" }} />
    </span>
  );
}

function EmptyStateGlyph() {
  return (
    <span style={{
      width: "34px",
      height: "34px",
      borderRadius: "12px",
      border: "1px dashed #2f2f2f",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      <span style={{ width: "14px", height: "2px", borderRadius: "999px", background: "#2f2f2f", position: "absolute", top: "10px" }} />
      <span style={{ width: "18px", height: "2px", borderRadius: "999px", background: "#2f2f2f" }} />
      <span style={{ width: "12px", height: "2px", borderRadius: "999px", background: "#2f2f2f", position: "absolute", bottom: "10px" }} />
    </span>
  );
}
