"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/events/categories";
import type { AppEntitlements } from "@/lib/entitlements";
import {
  fetchBillingOverview,
  formatPlanName,
  getBillingAccessSummary,
  getBillingWindowSummary,
  getDefaultBillingOverview,
  getLatestPaymentMeta,
  getLatestPaymentSummary,
  getOrderStatusLabel,
  getOrderStatusTone,
  getPlanHeadline,
  getUsageSummary,
  getWatermarkSummary,
  type BillingOverview,
  type BillingOrderSnapshot,
} from "@/lib/billing";
import { fetchProfile, getEmptyProfile, PROFILE_UPDATED_EVENT, UserProfile } from "@/lib/profile";
import { fetchTimeline, TimelineEvent, TIMELINE_UPDATED_EVENT } from "@/lib/timeline";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [billingOverview, setBillingOverview] = useState<BillingOverview>(getDefaultBillingOverview);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [nextProfile, nextTimeline, nextBillingOverview] = await Promise.all([
          fetchProfile(),
          fetchTimeline(),
          fetchBillingOverview(),
        ]);
        setProfile(nextProfile);
        setTimeline(nextTimeline);
        setBillingOverview(nextBillingOverview);
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

  const entitlements = billingOverview.entitlements;
  const latestOrder = billingOverview.latestOrder;
  const firstName = profile.name.split(" ").filter(Boolean)[0];
  const recent = timeline.slice(0, 4);
  const latestEvent = recent[0] ?? null;
  const recentMonth = new Date();
  recentMonth.setDate(recentMonth.getDate() - 30);

  const stats = [
    { label: "Saved workspaces", value: timeline.length },
    { label: "Created this month", value: timeline.filter((event) => new Date(event.createdAt) > recentMonth).length },
    { label: "Platforms used", value: new Set(timeline.flatMap((event) => event.platforms)).size },
  ];

  return (
    <div style={{ padding: "30px clamp(18px, 3vw, 34px) 42px", maxWidth: "960px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={eyebrowStyle}>Workspace</div>
        <h1 style={pageTitleStyle}>
          {firstName ? `What do you want to publish next, ${firstName}?` : "What do you want to publish next?"}
        </h1>
        <p style={pageCopyStyle}>Pick one starting point.</p>
      </div>

      <section style={{ ...cardStyle, padding: "22px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7f796f", marginBottom: "8px" }}>
              Billing
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#f3efe6", lineHeight: 1.1 }}>
                {getPlanHeadline(entitlements)}
              </div>
              <PlanPill plan={entitlements.plan} />
              {latestOrder ? <OrderStatusPill status={latestOrder.status} /> : null}
            </div>
            <div style={{ fontSize: "13px", color: "#918c83", lineHeight: 1.7 }}>
              {getBillingAccessSummary(billingOverview)}
            </div>
          </div>

          <Link href="/pricing" style={ghostLinkStyle}>
            {entitlements.plan === "free" ? "Upgrade plan" : "Manage billing"}
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
          <div style={{ ...softCardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a756c", marginBottom: "8px" }}>
              Exports
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f3efe6", marginBottom: "4px" }}>{getUsageSummary(entitlements)}</div>
            <div style={{ fontSize: "11px", color: "#8f8a81" }}>
              {entitlements.plan === "free" ? "Upgrade for unlimited downloads." : "Unlimited during your paid access."}
            </div>
          </div>

          <div style={{ ...softCardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a756c", marginBottom: "8px" }}>
              Access window
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f3efe6", marginBottom: "4px" }}>{getBillingWindowSummary(billingOverview)}</div>
            <div style={{ fontSize: "11px", color: "#8f8a81" }}>
              {entitlements.features.allowedThemes.length} themes available now.
            </div>
          </div>

          <div style={{ ...softCardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a756c", marginBottom: "8px" }}>
              Latest payment
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f3efe6", marginBottom: "4px" }}>{getLatestPaymentSummary(billingOverview)}</div>
            <div style={{ fontSize: "11px", color: "#8f8a81" }}>
              {getLatestPaymentMeta(billingOverview)}
            </div>
          </div>

          <div style={{ ...softCardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a756c", marginBottom: "8px" }}>
              Export style
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f3efe6", marginBottom: "4px" }}>{getWatermarkSummary(entitlements)}</div>
            <div style={{ fontSize: "11px", color: "#8f8a81" }}>
              {latestOrder ? `Order ${getOrderStatusLabel(latestOrder.status).toLowerCase()}.` : "No paid order yet."}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...cardStyle, padding: "24px", marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7f796f", marginBottom: "10px" }}>
          Start here
        </div>
        <div style={{ fontSize: "26px", fontWeight: 800, color: "#f3efe6", lineHeight: 1.08, marginBottom: "10px", maxWidth: "12ch" }}>
          Three easy ways to begin
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
          <ActionCard
            href="/create"
            title="Start manually"
            label="Flexible"
            copy="Choose the event yourself."
            accent="rgba(182,245,77,0.14)"
            border="rgba(182,245,77,0.22)"
          />
          <ActionCard
            href="/templates"
            title="Use a template"
            label="Fastest"
            copy="Start from a ready-made format."
            accent="rgba(255,255,255,0.04)"
            border="rgba(255,255,255,0.08)"
          />
          <ActionCard
            href={latestEvent ? `/create?reuse=${encodeURIComponent(latestEvent.id)}` : "/profile"}
            title={latestEvent ? "Reuse latest workspace" : "Finish profile setup"}
            label={latestEvent ? "Reuse" : "Setup"}
            copy={latestEvent ? `${latestEvent.eventTypeLabel} is already saved.` : "Save your core details once."}
            accent="rgba(241,199,109,0.10)"
            border="rgba(241,199,109,0.18)"
          />
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ ...softCardStyle, padding: "16px 18px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a756c", marginBottom: "8px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "#f3efe6" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
        <section style={{ ...cardStyle, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7f796f", marginBottom: "6px" }}>
                Recent workspaces
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#f3efe6" }}>
                Continue from saved work
              </div>
            </div>
            {timeline.length > 0 && (
              <Link href="/timeline" style={ghostLinkStyle}>
                Open saved work
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div style={{ ...softCardStyle, padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#f3efe6", marginBottom: "6px" }}>No workspaces yet</div>
              <div style={{ fontSize: "13px", color: "#8f8a81", lineHeight: 1.7, marginBottom: "16px" }}>Your first generated post will appear here.</div>
              <Link href="/create" style={primaryLinkStyle}>
                Create your first post
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {recent.map((event) => (
                <Link
                  key={event.id}
                  href={`/create?reuse=${encodeURIComponent(event.id)}`}
                  style={{ ...softCardStyle, padding: "14px 15px", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px" }}>{event.eventTypeIcon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#f3efe6", lineHeight: 1.35 }}>{event.title}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#89847a" }}>
                    {event.platforms.join(" / ")} - {formatDate(event.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={{ ...cardStyle, padding: "22px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7f796f", marginBottom: "8px" }}>
            Quick starts
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#f3efe6", marginBottom: "8px" }}>
            Start from a familiar lane
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {EVENT_CATEGORIES.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/create?category=${category.slug}`}
                style={{
                  ...softCardStyle,
                  padding: "13px 14px",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "12px",
                    background: `${category.color}18`,
                    border: `1px solid ${category.color}32`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    flexShrink: 0,
                  }}
                >
                  {category.icon}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f3efe6", marginBottom: "2px" }}>{category.label}</div>
                  <div style={{ fontSize: "11px", color: "#8f8a81", lineHeight: 1.55 }}>{shortCategoryDescription(category.description)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ActionCard({ href, title, label, copy, accent, border }: { href: string; title: string; label: string; copy: string; accent: string; border: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        padding: "16px",
        borderRadius: "18px",
        background: `linear-gradient(180deg, ${accent} 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        minHeight: "176px",
      }}
    >
      <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#857f75", marginBottom: "10px" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "#f3efe6", marginBottom: "8px", lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#948f85", lineHeight: 1.7, marginTop: "auto" }}>{copy}</div>
    </Link>
  );
}

function OrderStatusPill({ status }: { status: BillingOrderSnapshot["status"] }) {
  const tone = getOrderStatusTone(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "26px",
        padding: "0 10px",
        borderRadius: "999px",
        background: tone.background,
        border: `1px solid ${tone.border}`,
        color: tone.color,
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function PlanPill({ plan }: { plan: AppEntitlements["plan"] }) {
  const tone = getPlanTone(plan);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "26px",
        padding: "0 10px",
        borderRadius: "999px",
        background: tone.background,
        border: `1px solid ${tone.border}`,
        color: tone.color,
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {formatPlanName(plan)}
    </span>
  );
}

function getPlanTone(plan: AppEntitlements["plan"]) {
  if (plan === "lifetime") {
    return {
      background: "rgba(241,199,109,0.12)",
      border: "rgba(241,199,109,0.24)",
      color: "#f1c76d",
    };
  }

  if (plan === "pro") {
    return {
      background: "rgba(182,245,77,0.12)",
      border: "rgba(182,245,77,0.24)",
      color: "#c8f26c",
    };
  }

  return {
    background: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
    color: "#c8c1b5",
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shortCategoryDescription(description: string) {
  const firstPart = description.split(",")[0];
  return firstPart.trim();
}

const eyebrowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(182,245,77,0.08)",
  border: "1px solid rgba(182,245,77,0.16)",
  color: "#d2f083",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "14px",
};

const pageTitleStyle: CSSProperties = {
  fontSize: "clamp(30px, 4.4vw, 44px)",
  lineHeight: 1.04,
  letterSpacing: "-0.05em",
  color: "#f3efe6",
  margin: "0 0 10px",
  fontWeight: 800,
  maxWidth: "14ch",
};

const pageCopyStyle: CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#928c82",
  margin: 0,
  maxWidth: "720px",
};

const cardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(27,27,25,0.98) 0%, rgba(18,18,17,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "24px",
  boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
};

const softCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "18px",
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "42px",
  padding: "10px 16px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "linear-gradient(135deg, #b6f54d 0%, #d8f97e 100%)",
  color: "#171813",
  fontSize: "12px",
  fontWeight: 800,
};

const ghostLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "40px",
  padding: "10px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ece7dc",
  fontSize: "12px",
  fontWeight: 700,
};
