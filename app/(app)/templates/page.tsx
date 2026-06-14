"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCreateHrefForTemplateId } from "@/lib/routing";
import { TEMPLATES, TemplateCategory } from "@/lib/templates";

const CATEGORY_META: Record<TemplateCategory, { label: string; color: string; desc: string }> = {
  achievement: { label: "Achievement", color: "#a3e635", desc: "Hackathons, awards, certifications, and promotions" },
  career: { label: "Career", color: "#60a5fa", desc: "Promotions, new roles, internships, and open-to-work posts" },
  founder: { label: "Founder", color: "#fb923c", desc: "Launches, traction, revenue, and startup milestones" },
  creator: { label: "Creator", color: "#c084fc", desc: "Audience growth, channels, and creator launches" },
  events: { label: "Events", color: "#2dd4bf", desc: "Talks, webinars, and speaker milestones" },
  newsletter: { label: "Newsletter", color: "#f87171", desc: "Publishing, subscriber growth, and issue launches" },
};

export default function TemplatesPage() {
  const router = useRouter();
  const categories = Array.from(new Set(TEMPLATES.map((template) => template.category))) as TemplateCategory[];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              color: "#666",
              fontSize: "12px",
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid #1e1e1e",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Back
          </button>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f5f5f5", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              Template Library
            </h1>
            <p style={{ fontSize: "13px", color: "#555", margin: 0, maxWidth: "620px", lineHeight: 1.6 }}>
              Fast-start structures for promotions, certifications, open-to-work updates, and other milestone posts.
            </p>
          </div>
        </div>
        <Link href="/create" style={{
          padding: "8px 14px",
          background: "#141414",
          color: "#a3e635",
          fontSize: "12px",
          fontWeight: 700,
          borderRadius: "8px",
          textDecoration: "none",
          border: "1px solid #304217",
        }}>
          Open Create Hub
        </Link>
      </div>

      <div style={{
        background: "#111",
        border: "1px solid #1a1a1a",
        borderRadius: "12px",
        padding: "16px 18px",
        marginBottom: "24px",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>
          How To Use Templates
        </div>
        <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.65 }}>
          Templates skip category selection and preload the required fields. After that, you still control platforms, styling, preview, and final copy before generating.
        </div>
      </div>

      {categories.map((category) => {
        const meta = CATEGORY_META[category];
        if (!meta) return null;

        const templates = TEMPLATES.filter((template) => template.category === category);

        return (
          <div key={category} style={{ marginBottom: "32px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
              paddingBottom: "10px",
              borderBottom: "1px solid #1a1a1a",
            }}>
              <span style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: meta.color,
                display: "inline-block",
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0" }}>{meta.label}</div>
                <div style={{ fontSize: "11px", color: "#555" }}>{meta.desc}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {templates.map((template) => (
                <Link key={template.id} href={getCreateHrefForTemplateId(template.id)} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#111",
                    border: "1px solid #1a1a1a",
                    borderRadius: "10px",
                    padding: "16px",
                    cursor: "pointer",
                    height: "100%",
                  }}>
                    <div style={{ fontSize: "26px", marginBottom: "8px" }}>{template.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f0f0", marginBottom: "6px" }}>{template.name}</div>
                    <div style={{ fontSize: "10px", color: "#555", lineHeight: 1.55 }}>
                      {template.fields.filter((field) => field.required).length} required fields loaded for you
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "10px", color: meta.color, fontWeight: 700 }}>
                      Start with template {"->"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
