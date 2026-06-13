"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bootstrapSupabaseAnon } from "@/lib/supabase/bootstrap";
import { getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, profileCompletionSteps, UserProfile } from "@/lib/profile";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "grid", label: "Dashboard" },
  { href: "/create", icon: "spark", label: "Create" },
  { href: "/timeline", icon: "stack", label: "Saved Work" },
  { href: "/profile", icon: "user", label: "Brand Profile" },
  { href: "/templates", icon: "tiles", label: "Template Library" },
  { href: "/pricing", icon: "tag", label: "Pricing" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handler = () => setProfile(loadProfile());
    handler();
    window.addEventListener(PROFILE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    void bootstrapSupabaseAnon();
  }, []);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth < 960);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  const steps = profileCompletionSteps(profile);
  const completedCount = steps.filter((step) => step.done).length;
  const completionPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080808", position: "relative" }}>
      {isMobile && sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
          style={{
            position: "fixed",
            inset: 0,
            border: "none",
            background: "rgba(0,0,0,0.55)",
            zIndex: 9,
            cursor: "pointer",
          }}
        />
      )}

      <aside style={{
        width: sidebarOpen ? (isMobile ? "280px" : "240px") : "0px",
        flexShrink: 0,
        background: "#0e0e0e",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s ease",
        position: isMobile ? "fixed" : "relative",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        boxShadow: isMobile && sidebarOpen ? "0 24px 64px rgba(0,0,0,0.45)" : "none",
      }}>
        <div style={{ width: isMobile ? "280px" : "240px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt=""
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #1e1e1e",
                  flexShrink: 0,
                }}
              />
            ) : (
              <AvatarPlaceholder />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#f0f0f0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {profile.name || "Your Name"}
              </div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "1px" }}>
                SuperSmartX
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
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
                    padding: "9px 12px",
                    borderRadius: "8px",
                    background: active ? "#1a1a1a" : "transparent",
                    color: active ? "#f0f0f0" : "#666",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.15s",
                    borderLeft: active ? "2px solid #a3e635" : "2px solid transparent",
                  }}
                >
                  <span style={{ width: "18px", display: "inline-flex", justifyContent: "center", opacity: active ? 1 : 0.6 }}>
                    <NavIcon kind={item.icon} active={active} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {completionPct < 100 && (
            <div style={{
              margin: "0 10px 10px",
              padding: "14px",
              background: "#141414",
              border: "1px solid #1e1e1e",
              borderRadius: "10px",
            }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "6px" }}>
                Brand Setup
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0" }}>{completionPct}%</div>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: "8px" }}>
                {completedCount} of {steps.length} complete
              </div>
              <div style={{ background: "#1e1e1e", borderRadius: "4px", height: "4px", marginBottom: "10px" }}>
                <div style={{
                  width: `${completionPct}%`,
                  height: "4px",
                  background: "linear-gradient(90deg, #a3e635, #84cc16)",
                  borderRadius: "4px",
                  transition: "width 0.3s",
                }} />
              </div>
              <Link
                href="/profile"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "7px",
                  background: "#a3e635",
                  color: "#000",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Complete Brand Profile
              </Link>
            </div>
          )}

          <div style={{ padding: "12px 10px", borderTop: "1px solid #1a1a1a" }}>
            <Link
              href="/sign-in"
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#555",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
              }}
            >
              {"<-"} Sign Out
            </Link>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          height: "52px",
          flexShrink: 0,
          background: "#0e0e0e",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "0 14px" : "0 20px",
          gap: "12px",
        }}>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            style={{
              background: "transparent",
              color: "#555",
              fontSize: "14px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Menu
          </button>

          <div style={{ flex: 1 }} />

          <Link
            href="/create"
            style={{
              padding: "6px 14px",
              background: "linear-gradient(135deg, #a3e635, #84cc16)",
              color: "#000",
              fontSize: "12px",
              fontWeight: 700,
              borderRadius: "7px",
              textDecoration: "none",
            }}
          >
            {isMobile ? "New" : "New Post"}
          </Link>

          <Link
            href="/pricing"
            style={{
              padding: "6px 12px",
              background: "#1a1a1a",
              color: "#888",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: "7px",
              textDecoration: "none",
              border: "1px solid #2a2a2a",
              display: isMobile ? "none" : "inline-flex",
            }}
          >
            Upgrade
          </Link>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AvatarPlaceholder() {
  return (
    <div style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    }}>
      <span style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#7a7a7a",
        position: "absolute",
        top: "8px",
      }} />
      <span style={{
        width: "18px",
        height: "9px",
        borderRadius: "999px 999px 6px 6px",
        background: "#5c5c5c",
        position: "absolute",
        bottom: "7px",
      }} />
    </div>
  );
}

function NavIcon({ kind, active }: { kind: string; active: boolean }) {
  const tone = active ? "#a3e635" : "#666";

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
