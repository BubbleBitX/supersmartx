import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { getCreateHrefForTemplateId } from "@/lib/routing";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const template = TEMPLATES.find((item) => item.slug === params.slug);
  if (!template) return {};

  return {
    title: `${template.name} LinkedIn Post Generator - SuperSmartX`,
    description: `Create a LinkedIn-ready ${template.name.toLowerCase()} graphic and caption in minutes.`,
    openGraph: {
      title: `${template.name} LinkedIn Post Generator`,
      description: `Create a LinkedIn-ready ${template.name.toLowerCase()} asset instantly.`,
      type: "website",
    },
    alternates: {
      canonical: `/t/${template.slug}`,
    },
  };
}

export default function TemplateSEOPage({ params }: Props) {
  const template = TEMPLATES.find((item) => item.slug === params.slug);
  if (!template) notFound();

  const CATEGORY_COLOR: Record<string, string> = {
    achievement: "#a3e635",
    career: "#60a5fa",
    founder: "#fb923c",
    creator: "#c084fc",
    events: "#2dd4bf",
    newsletter: "#f87171",
  };
  const color = CATEGORY_COLOR[template.category] ?? "#a3e635";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "48px 24px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <Link href="/templates" style={{ fontSize: "13px", color: "#555", textDecoration: "none" }}>
          ← All Templates
        </Link>

        <div style={{ marginTop: "24px", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>{template.icon}</div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#f5f5f5", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            {template.name} LinkedIn Post Generator
          </h1>
          <p style={{ fontSize: "15px", color: "#666", margin: 0, lineHeight: 1.6 }}>
            Create a LinkedIn-ready {template.name.toLowerCase()} graphic and caption in minutes.
            Fill the form, customize the style, and export platform-specific output.
          </p>
        </div>

        <div style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "24px",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "14px" }}>
            Required Information
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {template.fields.map((field) => (
              <div key={field.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: field.required ? color : "#333",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span style={{ fontSize: "13px", color: "#ccc" }}>{field.label}</span>
                  {!field.required && <span style={{ fontSize: "10px", color: "#444", marginLeft: "6px" }}>(optional)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={getCreateHrefForTemplateId(template.id)}
          style={{
            display: "inline-block",
            padding: "12px 18px",
            background: color,
            color: "#000",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          Use This Template
        </Link>
      </div>
    </div>
  );
}
