"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProfile, getEmptyProfile, PROFILE_UPDATED_EVENT, profileCompletionSteps, UserProfile } from "@/lib/profile";
import { fetchTimeline, TimelineEvent, TIMELINE_UPDATED_EVENT } from "@/lib/timeline";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "grid", label: "Workspace" },
  { href: "/create", icon: "spark", label: "Create" },
  { href: "/timeline", icon: "stack", label: "Saved" },
  { href: "/profile", icon: "user", label: "Profile" },
  { href: "/templates", icon: "tiles", label: "Templates" },
  { href: "/pricing", icon: "tag", label: "Pricing" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [nextProfile, nextTimeline] = await Promise.all([fetchProfile(), fetchTimeline()]);
        setProfile(nextProfile);
        setTimeline(nextTimeline);
      } catch (error) {
        console.error(error);
      }
    };

    void refresh();
    const handleRefresh = () => {
      void refresh();
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, handleRefresh);
    window.addEventListener(TIMELINE_UPDATED_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleRefresh);
      window.removeEventListener(TIMELINE_UPDATED_EVENT, handleRefresh);
    };
  }, []);

  useEffect(() => {
    // Intentional mount handshake so the first client render matches the server placeholder.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      const nextIsMobile = window.innerWidth < 1100;
      setIsMobile(nextIsMobile);
      setSidebarOpen(nextIsMobile ? false : true);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const steps = profileCompletionSteps(profile);
  const completedCount = steps.filter((step) => step.done).length;
  const completionPct = Math.round((completedCount / steps.length) * 100);
  const latestEvent = timeline[0] ?? null;
  const recentTimeline = timeline.slice(0, 3);
  const meta = getWorkspaceMeta(pathname, latestEvent);

  if (!hasMounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a09",
          color: "#f3efe6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        Loading workspace...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0a09",
        color: "#f3efe6",
        position: "relative",
      }}
    >
      {isMobile && sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
          style={{
            position: "fixed",
            inset: 0,
            border: "none",
            background: "rgba(0,0,0,0.58)",
            zIndex: 19,
            cursor: "pointer",
          }}
        />
      )}

      <aside
        style={{
          width: sidebarOpen ? (isMobile ? "286px" : "248px") : "0px",
          flexShrink: 0,
          background: "#0f0f0e",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.24s ease",
          position: isMobile ? "fixed" : "relative",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 20,
          boxShadow: isMobile && sidebarOpen ? "0 24px 64px rgba(0,0,0,0.42)" : "none",
        }}
      >
        <div style={{ width: isMobile ? "286px" : "248px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              {profile.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "14px",
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <AvatarPlaceholder />
              )}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#f3efe6",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile.name || "Your workspace"}
                </div>
                <div style={{ fontSize: "10px", color: "#7f7a71", marginTop: "2px" }}>SuperSmartX</div>
              </div>
            </div>

            <Link href="/create" onClick={() => isMobile && setSidebarOpen(false)} style={primaryButtonStyle}>
              New milestone
            </Link>
          </div>

          <nav style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 12px",
                    borderRadius: "14px",
                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                    color: active ? "#f3efe6" : "#8b857b",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    border: active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  }}
                >
                  <span style={{ width: "18px", display: "inline-flex", justifyContent: "center", opacity: active ? 1 : 0.72 }}>
                    <NavIcon kind={item.icon} active={active} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", padding: "12px 10px 14px" }}>
            <div style={sidebarCardStyle}>
              <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#777269", marginBottom: "8px" }}>
                Profile ready
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#f3efe6", marginBottom: "3px" }}>{completionPct}%</div>
              <div style={{ fontSize: "11px", color: "#8e897f", marginBottom: "10px" }}>{completedCount}/{steps.length} done</div>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "10px" }}>
                <div
                  style={{
                    width: `${completionPct}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #b6f54d 0%, #dacf84 100%)",
                    borderRadius: "999px",
                  }}
                />
              </div>
              <Link href="/profile" onClick={() => isMobile && setSidebarOpen(false)} style={secondaryButtonStyle}>
                {completionPct < 100 ? "Complete profile" : "Review profile"}
              </Link>
            </div>

            <button
              onClick={() => void handleSignOut()}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#a39d92",
                padding: "10px 12px",
                marginTop: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            height: "64px",
            flexShrink: 0,
            background: "#10100f",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "0 14px" : "0 18px 0 20px",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            style={{
              background: "transparent",
              color: "#8d877d",
              fontSize: "14px",
              padding: "6px 10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            Menu
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c776e", marginBottom: "2px" }}>
              {meta.label}
            </div>
            {!isMobile && <div style={{ fontSize: "12px", color: "#9b958b" }}>{meta.title}</div>}
          </div>

          <div style={{ flex: 1 }} />

          {!isMobile && meta.secondaryAction && (
            <Link href={meta.secondaryAction.href} style={headerSecondaryActionStyle}>
              {meta.secondaryAction.label}
            </Link>
          )}

          <Link href={meta.primaryAction.href} style={headerPrimaryActionStyle}>
            {isMobile ? meta.primaryAction.shortLabel : meta.primaryAction.label}
          </Link>
        </header>

        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <main
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              background:
                "radial-gradient(circle at top left, rgba(182,245,77,0.05), transparent 20%), radial-gradient(circle at top right, rgba(241,199,109,0.06), transparent 18%), #090908",
            }}
          >
            {children}
          </main>

          {!isMobile && (
            <aside
              style={{
                width: "318px",
                flexShrink: 0,
                background: "#10100f",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                overflowY: "auto",
              }}
            >
              <RightRail
                meta={meta}
                completionPct={completionPct}
                latestEvent={latestEvent}
                recentTimeline={recentTimeline}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function RightRail({
  meta,
  completionPct,
  latestEvent,
  recentTimeline,
}: {
  meta: WorkspaceMeta;
  completionPct: number;
  latestEvent: TimelineEvent | null;
  recentTimeline: TimelineEvent[];
}) {
  return (
    <div style={{ padding: "18px 16px 22px", display: "grid", gap: "16px" }}>
      <RailCard eyebrow="Page" title={meta.title} copy={meta.summary} />

      <RailCard eyebrow="Profile" title={`${completionPct}% ready`} copy="Saved profile = faster posts.">
        <div style={{ height: "7px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: "12px" }}>
          <div
            style={{
              width: `${completionPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #b6f54d 0%, #dacf84 100%)",
              borderRadius: "999px",
            }}
          />
        </div>
        <Link href="/profile" style={secondaryButtonStyle}>
          {completionPct < 100 ? "Complete profile setup" : "Open profile"}
        </Link>
      </RailCard>

      <RailCard
        eyebrow="Saved"
        title={latestEvent ? latestEvent.title : "No saved workspace yet"}
        copy={
          latestEvent
            ? `${latestEvent.eventTypeLabel} · ${formatDate(latestEvent.createdAt)}`
            : "Your generated posts will show up here."
        }
      >
        {recentTimeline.length === 0 ? (
          <Link href="/create" style={secondaryButtonStyle}>
            Create first post
          </Link>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {recentTimeline.map((event) => (
              <Link
                key={event.id}
                href={`/create?reuse=${encodeURIComponent(event.id)}`}
                style={{
                  ...softCardStyle,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1ece2", marginBottom: "4px", lineHeight: 1.4 }}>
                  {event.title}
                </div>
                <div style={{ fontSize: "10px", color: "#878279" }}>
                  {event.platforms.join(" / ")} · {formatDate(event.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </RailCard>
    </div>
  );
}

function RailCard({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={railCardStyle}>
      <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#787369", marginBottom: "8px" }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: "20px", fontWeight: 800, color: "#f3efe6", lineHeight: 1.12, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#918c83", lineHeight: 1.65, marginBottom: "14px" }}>{copy}</div>
      {children}
    </section>
  );
}

function AvatarPlaceholder() {
  return (
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#888278",
          position: "absolute",
          top: "8px",
        }}
      />
      <span
        style={{
          width: "18px",
          height: "9px",
          borderRadius: "999px 999px 6px 6px",
          background: "#68635c",
          position: "absolute",
          bottom: "8px",
        }}
      />
    </div>
  );
}

function NavIcon({ kind, active }: { kind: string; active: boolean }) {
  const tone = active ? "#c9f472" : "#8c857a";

  if (kind === "grid") {
    return (
      <span style={{ display: "grid", gridTemplateColumns: "repeat(2, 4px)", gap: "2px" }}>
        {[0, 1, 2, 3].map((item) => (
          <span key={item} style={{ width: "4px", height: "4px", borderRadius: "1px", background: tone }} />
        ))}
      </span>
    );
  }

  if (kind === "spark") {
    return (
      <span style={{ position: "relative", width: "12px", height: "12px", display: "inline-block" }}>
        <span style={{ position: "absolute", left: "5px", top: "0", width: "2px", height: "12px", borderRadius: "999px", background: tone }} />
        <span style={{ position: "absolute", left: "0", top: "5px", width: "12px", height: "2px", borderRadius: "999px", background: tone }} />
      </span>
    );
  }

  if (kind === "stack") {
    return (
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {[0, 1, 2].map((item) => (
          <span key={item} style={{ width: "12px", height: "2px", borderRadius: "999px", background: tone }} />
        ))}
      </span>
    );
  }

  if (kind === "user") {
    return (
      <span style={{ position: "relative", width: "12px", height: "12px", display: "inline-block" }}>
        <span style={{ position: "absolute", left: "3px", top: "0", width: "6px", height: "6px", borderRadius: "50%", border: `1.5px solid ${tone}` }} />
        <span style={{ position: "absolute", left: "1px", bottom: "0", width: "10px", height: "5px", borderRadius: "999px 999px 3px 3px", border: `1.5px solid ${tone}` }} />
      </span>
    );
  }

  if (kind === "tiles") {
    return (
      <span style={{ display: "grid", gridTemplateColumns: "repeat(2, 5px)", gridTemplateRows: "repeat(2, 5px)", gap: "2px" }}>
        <span style={{ borderRadius: "2px", background: tone }} />
        <span style={{ borderRadius: "2px", background: tone, opacity: 0.8 }} />
        <span style={{ borderRadius: "2px", background: tone, opacity: 0.8 }} />
        <span style={{ borderRadius: "2px", background: tone }} />
      </span>
    );
  }

  return (
    <span style={{ position: "relative", width: "12px", height: "12px", display: "inline-block" }}>
      <span style={{ position: "absolute", inset: "1px", borderRadius: "3px", border: `1.5px solid ${tone}` }} />
      <span style={{ position: "absolute", left: "2px", right: "2px", top: "4px", height: "1.5px", background: tone }} />
    </span>
  );
}

type WorkspaceMeta = {
  label: string;
  title: string;
  summary: string;
  primaryAction: { href: string; label: string; shortLabel: string };
  secondaryAction?: { href: string; label: string };
  notes: { title: string; copy: string }[];
};

function getWorkspaceMeta(pathname: string, latestEvent: TimelineEvent | null): WorkspaceMeta {
  if (pathname.startsWith("/create")) {
    return {
      label: "Create",
      title: "Draft and publish",
      summary: "Move from details to output.",
      primaryAction: { href: "/templates", label: "Browse templates", shortLabel: "Templates" },
      secondaryAction: { href: "/profile", label: "Update profile" },
      notes: [
        { title: "Tip", copy: "Keep role, company, and milestone text short and clear." },
      ],
    };
  }

  if (pathname.startsWith("/timeline")) {
    return {
      label: "Saved",
      title: "Review and reuse",
      summary: "Open an older post fast.",
      primaryAction: { href: "/create", label: "Create new post", shortLabel: "New" },
      secondaryAction: { href: "/templates", label: "Open templates" },
      notes: [
        { title: "Tip", copy: "Reuse a saved draft when the format is already close." },
      ],
    };
  }

  if (pathname.startsWith("/profile")) {
    return {
      label: "Profile",
      title: "Save once, reuse often",
      summary: "Keep your core details ready.",
      primaryAction: { href: "/create", label: "Open create flow", shortLabel: "Create" },
      secondaryAction: { href: "/dashboard", label: "Go to workspace" },
      notes: [
        { title: "Tip", copy: "Name, role, company, and photo matter most." },
      ],
    };
  }

  if (pathname.startsWith("/templates")) {
    return {
      label: "Templates",
      title: "Choose a starting format",
      summary: "Pick the closest template.",
      primaryAction: { href: "/create", label: "Start manually", shortLabel: "Manual" },
      secondaryAction: { href: "/timeline", label: "Open saved work" },
      notes: [
        { title: "Tip", copy: "Choose the closest format first, then customize." },
      ],
    };
  }

  if (pathname.startsWith("/pricing")) {
    return {
      label: "Pricing",
      title: "Simple pricing",
      summary: "Pay for faster posting.",
      primaryAction: { href: "/create", label: "Try create flow", shortLabel: "Try" },
      secondaryAction: { href: "/dashboard", label: "Back to workspace" },
      notes: [
        { title: "Tip", copy: "Lead with saved time and reuse." },
      ],
    };
  }

  return {
    label: "Workspace",
    title: "One place to create your next post",
    summary: "Start, reuse, and publish.",
    primaryAction: { href: "/create", label: "New LinkedIn post", shortLabel: "New" },
    secondaryAction: latestEvent
      ? { href: `/create?reuse=${encodeURIComponent(latestEvent.id)}`, label: "Reuse latest draft" }
      : { href: "/templates", label: "Open templates" },
    notes: [
      { title: "Tip", copy: "Use the center to start. Use the side rail only for support." },
    ],
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "42px",
  padding: "10px 14px",
  borderRadius: "14px",
  textDecoration: "none",
  background: "linear-gradient(135deg, #b6f54d 0%, #d8f97e 100%)",
  color: "#171813",
  fontSize: "12px",
  fontWeight: 800,
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "40px",
  padding: "10px 12px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ece7dc",
  fontSize: "12px",
  fontWeight: 700,
  boxSizing: "border-box",
};

const headerPrimaryActionStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "linear-gradient(135deg, #b6f54d 0%, #d8f97e 100%)",
  color: "#171813",
  fontSize: "12px",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const headerSecondaryActionStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ece7dc",
  fontSize: "12px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const sidebarCardStyle: CSSProperties = {
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const railCardStyle: CSSProperties = {
  padding: "18px",
  borderRadius: "22px",
  background: "linear-gradient(180deg, rgba(27,27,25,0.98) 0%, rgba(19,19,18,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const softCardStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};


