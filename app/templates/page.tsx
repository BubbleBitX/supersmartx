"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATES, TemplateCategory } from "@/lib/templates";
import { getCreateHrefForTemplateId } from "@/lib/routing";

const CATEGORY_META: Record<TemplateCategory, { label: string; icon: string; color: string; desc: string }> = {
  achievement: { label: "Achievement", icon: "🏆", color: "#a3e635", desc: "Hackathons, awards, certifications, promotions" },
  career: { label: "Career", icon: "💼", color: "#60a5fa", desc: "New jobs, open to work announcements" },
  founder: { label: "Founder", icon: "🚀", color: "#fb923c", desc: "Startup launch, product launch, revenue milestones" },
  creator: { label: "Creator", icon: "🎬", color: "#c084fc", desc: "YouTube milestones, audience growth, creator launches" },
  events: { label: "Events", icon: "🎤", color: "#2dd4bf", desc: "Speaker announcements, webinars" },
  newsletter: { label: "Newsletter", icon: "📰", color: "#f87171", desc: "Newsletter launches, subscriber growth, publication updates" },
};

export default function TemplatesPage() {
  const router = useRouter();
  const categories = Array.from(new Set(TEMPLATES.map((template) => template.category))) as TemplateCategory[];

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
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
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f5f5f5", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Templates
          </h1>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            {TEMPLATES.length} quick-start templates. Click any card to start with a structured format.
          </p>
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
              <span style={{ fontSize: "18px" }}>{meta.icon}</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0" }}>{meta.label}</div>
                <div style={{ fontSize: "11px", color: "#555" }}>{meta.desc}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
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
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f0f0", marginBottom: "4px" }}>{template.name}</div>
                    <div style={{ fontSize: "10px", color: "#555" }}>
                      {template.fields.filter((field) => field.required).length} required fields
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "10px", color: meta.color, fontWeight: 600 }}>
                      Use template →
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
