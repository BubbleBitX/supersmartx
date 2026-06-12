"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, profileCompletionSteps, UserProfile } from "@/lib/profile";
import { bootstrapSupabaseAnon } from "@/lib/supabase/bootstrap";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/create", icon: "✦", label: "Create Event" },
  { href: "/timeline", icon: "◎", label: "My Timeline" },
  { href: "/profile", icon: "◉", label: "Profile" },
  { href: "/templates", icon: "⊟", label: "Templates" },
  { href: "/pricing", icon: "◈", label: "Pricing" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handler = () => setProfile(loadProfile());
    handler();
    window.addEventListener(PROFILE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    void bootstrapSupabaseAnon();
  }, []);

  const steps = profileCompletionSteps(profile);
  const completedCount = steps.filter((step) => step.done).length;
  const completionPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080808" }}>
      <aside style={{
        width: sidebarOpen ? "240px" : "0px",
        flexShrink: 0,
        background: "#0e0e0e",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s ease",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ width: "240px", height: "100%", display: "flex", flexDirection: "column" }}>
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
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                flexShrink: 0,
              }}>
                ◉
              </div>
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
                  <span style={{ fontSize: "14px", opacity: active ? 1 : 0.6 }}>{item.icon}</span>
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
                Complete Profile
              </Link>
            </div>
          )}

          <div style={{ padding: "12px 10px", borderTop: "1px solid #1a1a1a" }}>
            <Link
              href="/sign-in"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#555",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                transition: "color 0.15s",
              }}
            >
              ↪ Sign Out
            </Link>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          height: "52px",
          flexShrink: 0,
          background: "#0e0e0e",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "12px",
        }}>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            style={{
              background: "transparent",
              color: "#555",
              fontSize: "16px",
              padding: "4px 8px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ☰
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
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ✦ New Event
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
