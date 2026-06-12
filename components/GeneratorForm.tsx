"use client";
import React, { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import {
  TEMPLATES, ACCENT_COLORS, PROFILE_SHAPES, LAYOUTS, THEMES,
  BADGE_STYLES, FONT_PAIRS, LOGO_PLACEMENTS, CTA_STYLES, DOWNLOAD_FORMATS,
  Template, AccentColor, ProfileShape, Layout, Theme,
  BadgeStyle, FontPair, LogoPlacement, CtaStyle, DownloadFormat,
} from "@/lib/templates";
import { generateCaption } from "@/lib/caption";
import AchievementCard from "./AchievementCard";

import { track } from "@/lib/analytics";

const CATEGORY_LABELS: Record<string, string> = {
  achievement: "🏆 Achievement",
  career:      "💼 Career",
  founder:     "🚀 Founder",
  creator:     "🎬 Creator",
  events:      "🎤 Events",
};

const BTN = (active: boolean, accent = "#a3e635") => ({
  padding: "4px 10px",
  fontSize: "11px",
  borderRadius: "6px",
  background: active ? accent : "#1a1a1a",
  color: active ? "#000" : "#888",
  border: `1px solid ${active ? accent : "#2a2a2a"}`,
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
  transition: "all 0.15s",
  textTransform: "capitalize" as const,
} as React.CSSProperties);

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ fontSize: "10px", letterSpacing: "2.5px", color: "#555", textTransform: "uppercase", marginBottom: "10px", fontWeight: 600 }}>
      {label}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: "none", borderTop: "1px solid #1e1e1e", margin: "4px 0" }} />;
}

export default function GeneratorForm({ initialTemplateId }: { initialTemplateId?: string }) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    TEMPLATES.find(t => t.id === initialTemplateId) ?? TEMPLATES[0]
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Customization state
  const [theme, setTheme]               = useState<Theme>("dark");
  const [accentColor, setAccentColor]   = useState<AccentColor>("lime");
  const [profileShape, setProfileShape] = useState<ProfileShape>("rounded");
  const [layout, setLayout]             = useState<Layout>("A");
  const [badgeStyle, setBadgeStyle]     = useState<BadgeStyle>("professional");
  const [fontPair, setFontPair]         = useState<FontPair>("classic");
  const [logoPlacement, setLogoPlacement] = useState<LogoPlacement>("bottom");
  const [ctaStyle, setCtaStyle]         = useState<CtaStyle>("follow");
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("square");
  const [watermark, setWatermark]       = useState(false); // toggle for free tier demo

  // Output state
  const [caption, setCaption]       = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [activeTab, setActiveTab]   = useState<"graphic" | "caption">("graphic");

  const cardRef    = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));

  const handleTemplateSelect = (t: Template) => {
    setSelectedTemplate(t);
    setFormValues({});
    setIsGenerated(false);
    setCaption("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    const newCaption = generateCaption(selectedTemplate, formValues);
    setCaption(newCaption);
    setIsGenerated(true);
    setActiveTab("graphic");
    track("generate_clicked", { template: selectedTemplate.id });

    // Save to localStorage dashboard
    try {
      const entry = {
        id: `${selectedTemplate.id}_${Date.now()}`,
        templateName: selectedTemplate.name,
        templateIcon: selectedTemplate.icon,
        name: formValues.name || "",
        event: formValues.event || formValues.productIdea || "",
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("g2o_generations") || "[]");
      localStorage.setItem("g2o_generations", JSON.stringify([entry, ...existing].slice(0, 50)));
    } catch {}

  };

  const fmt = DOWNLOAD_FORMATS.find(f => f.key === downloadFormat)!;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const scaleX = fmt.width  / fmt.displayW;
      const scaleY = fmt.height / fmt.displayH;
      const scale  = Math.max(scaleX, scaleY);
      const dataUrl = await toPng(cardRef.current, {
        width:  fmt.width,
        height: fmt.height,
        style: { transform: `scale(${scale})`, transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = `${selectedTemplate.slug}-${formValues.name || "achievement"}-${downloadFormat}.png`;
      link.href = dataUrl;
      link.click();
      track("download_clicked", { template: selectedTemplate.id, format: downloadFormat });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedTemplate, formValues, fmt, downloadFormat]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardProps = {
    name:        formValues.name       || "",
    profession:  formValues.profession || "",
    company:     formValues.company    || "",
    event:       formValues.event      || "",
    productIdea: formValues.productIdea|| "",
    topLine:     formValues.topLine    || "",
    photoUrl,
    theme, accentColor, profileShape, layout,
    badgeStyle, fontPair, logoPlacement, ctaStyle,
    downloadFormat, watermark,
    cardRef,
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)", overflow: "hidden" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div style={{
        width: "400px", flexShrink: 0,
        background: "#111", borderRight: "1px solid #1e1e1e",
        overflowY: "auto", padding: "20px",
        display: "flex", flexDirection: "column", gap: "18px",
      }}>

        {/* Template picker */}
        <div>
          <SectionHead label="Template" />
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: "5px", fontWeight: 700, letterSpacing: "0.5px" }}>
                {CATEGORY_LABELS[cat]}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {TEMPLATES.filter(t => t.category === cat).map(t => (
                  <button key={t.id} onClick={() => handleTemplateSelect(t)} style={BTN(selectedTemplate.id === t.id)}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Photo upload */}
        <div>
          <SectionHead label="Profile Image *" />
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "72px", height: "72px", borderRadius: "50%",
                border: "2px dashed #2a2a2a", cursor: "pointer",
                overflow: "hidden", background: "#1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "border-color 0.2s",
              }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ textAlign: "center", pointerEvents: "none" }}>
                    <div style={{ fontSize: "18px" }}>📷</div>
                    <div style={{ fontSize: "8px", color: "#555", marginTop: "1px" }}>Upload</div>
                  </div>
              }
            </div>
            {photoUrl && (
              <button onClick={() => fileInputRef.current?.click()} style={{ fontSize: "11px", color: "#666", background: "transparent", padding: 0 }}>
                Change image
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
        </div>

        <Divider />

        {/* Dynamic form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <SectionHead label="Details" />
          {selectedTemplate.fields.map(field => (
            <div key={field.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <label style={{ fontSize: "11px", color: "#777" }}>
                  {field.label} {field.required && <span style={{ color: "#f87171" }}>*</span>}
                </label>
                <span style={{ fontSize: "9px", color: "#444" }}>
                  {(formValues[field.key] || "").length}/{field.maxLength}
                </span>
              </div>
              {field.type === "textarea" ? (
                <textarea
                  value={formValues[field.key] || ""}
                  onChange={e => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  rows={3}
                  style={{
                    background: "#161616", border: "1px solid #252525", borderRadius: "8px",
                    color: "#f0f0f0", padding: "9px 12px", width: "100%",
                    fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"}
                />
              ) : (
                <input
                  type="text"
                  value={formValues[field.key] || ""}
                  onChange={e => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  style={{
                    background: "#161616", border: "1px solid #252525", borderRadius: "8px",
                    color: "#f0f0f0", padding: "9px 12px", width: "100%",
                    fontSize: "13px", outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"}
                />
              )}
            </div>
          ))}
        </div>

        <Divider />

        {/* ── CUSTOMIZATION ────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <SectionHead label="Customization" />

          {/* Theme */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Theme</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {THEMES.map(t => <button key={t} onClick={() => setTheme(t)} style={BTN(theme === t)}>{t}</button>)}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Accent Color</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(Object.keys(ACCENT_COLORS) as AccentColor[]).map(c => (
                <div key={c} onClick={() => setAccentColor(c)} title={c} style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  background: ACCENT_COLORS[c].primary, cursor: "pointer",
                  border: accentColor === c ? "3px solid white" : "3px solid transparent",
                  outline: accentColor === c ? `2px solid ${ACCENT_COLORS[c].primary}` : "none",
                  transition: "all 0.15s",
                }} />
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Layout</label>
            <div style={{ display: "flex", gap: "5px" }}>
              {LAYOUTS.map(l => <button key={l} onClick={() => setLayout(l)} style={BTN(layout === l)}>Layout {l}</button>)}
            </div>
          </div>

          {/* Profile Shape */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Profile Shape</label>
            <div style={{ display: "flex", gap: "5px" }}>
              {PROFILE_SHAPES.map(s => <button key={s} onClick={() => setProfileShape(s)} style={BTN(profileShape === s)}>{s}</button>)}
            </div>
          </div>

          {/* Badge Style */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Badge Style</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {BADGE_STYLES.map(b => <button key={b} onClick={() => setBadgeStyle(b)} style={BTN(badgeStyle === b)}>{b}</button>)}
            </div>
          </div>

          {/* Font Pair */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Font Pair</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {(Object.keys(FONT_PAIRS) as FontPair[]).map(f => (
                <button key={f} onClick={() => setFontPair(f)} style={BTN(fontPair === f)}>{FONT_PAIRS[f].label}</button>
              ))}
            </div>
          </div>

          {/* Logo Placement */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>Logo Placement</label>
            <div style={{ display: "flex", gap: "5px" }}>
              {LOGO_PLACEMENTS.map(l => <button key={l} onClick={() => setLogoPlacement(l)} style={BTN(logoPlacement === l)}>{l}</button>)}
            </div>
          </div>

          {/* CTA Style */}
          <div>
            <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "7px" }}>CTA Style</label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {CTA_STYLES.map(c => (
                <button key={c.key} onClick={() => setCtaStyle(c.key)} style={{ ...BTN(ctaStyle === c.key), fontSize: "10px" }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Watermark toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "11px", color: "#666" }}>Watermark (Free tier)</label>
            <div
              onClick={() => setWatermark(w => !w)}
              style={{
                width: "36px", height: "20px", borderRadius: "10px",
                background: watermark ? "#a3e635" : "#2a2a2a",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                background: "#fff", position: "absolute",
                top: "3px", left: watermark ? "19px" : "3px",
                transition: "left 0.2s",
              }} />
            </div>
          </div>
        </div>

        <Divider />

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          style={{
            padding: "13px", background: "linear-gradient(135deg, #a3e635, #84cc16)",
            color: "#000", fontSize: "14px", fontWeight: 700,
            borderRadius: "10px", letterSpacing: "0.2px",
          }}
        >
          ✦ Generate LinkedIn Post &amp; Image
        </button>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, background: "#0a0a0a",
        overflowY: "auto", padding: "24px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>
        {!isGenerated ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "12px", color: "#333",
          }}>
            <div style={{ fontSize: "44px", opacity: 0.3 }}>✦</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>Fill the form and click Generate</div>
            <div style={{ fontSize: "12px", color: "#333" }}>Your professional achievement graphic will appear here</div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", background: "#161616", borderRadius: "8px", padding: "4px", width: "fit-content" }}>
              {(["graphic", "caption"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "6px 16px", fontSize: "12px", borderRadius: "6px",
                  background: activeTab === tab ? "#222" : "transparent",
                  color: activeTab === tab ? "#f5f5f5" : "#555",
                  fontWeight: activeTab === tab ? 600 : 400,
                }}>
                  {tab === "graphic" ? "🖼 Generated Image" : "📝 LinkedIn Caption"}
                </button>
              ))}
            </div>

            {activeTab === "graphic" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Download format selector */}
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#444", textTransform: "uppercase", marginBottom: "8px" }}>Download Format</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DOWNLOAD_FORMATS.map(f => (
                      <button key={f.key} onClick={() => setDownloadFormat(f.key)} style={{
                        padding: "5px 12px", fontSize: "11px", borderRadius: "6px",
                        background: downloadFormat === f.key ? "#a3e635" : "#161616",
                        color: downloadFormat === f.key ? "#000" : "#666",
                        border: `1px solid ${downloadFormat === f.key ? "#a3e635" : "#252525"}`,
                        fontWeight: downloadFormat === f.key ? 600 : 400,
                      }}>
                        {f.label}
                        <span style={{ fontSize: "9px", opacity: 0.6, marginLeft: "4px" }}>{f.width}×{f.height}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card preview */}
                <div style={{ overflow: "hidden", borderRadius: "10px", display: "inline-block", boxShadow: "0 0 0 1px #1e1e1e, 0 16px 48px rgba(0,0,0,0.5)" }}>
                  <AchievementCard {...cardProps} />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{
                      flex: 1, padding: "11px",
                      background: isDownloading ? "#1a1a1a" : "#1e1e1e",
                      color: "#f0f0f0", fontSize: "12px", fontWeight: 600,
                      borderRadius: "8px", border: "1px solid #2a2a2a",
                    }}
                  >
                    {isDownloading ? "⏳ Exporting..." : `⬇ Download (${fmt.width}×${fmt.height})`}
                  </button>
                  <button onClick={handleCopyCaption} style={{
                    flex: 1, padding: "11px",
                    background: "#1e1e1e", color: "#f0f0f0",
                    fontSize: "12px", fontWeight: 600, borderRadius: "8px", border: "1px solid #2a2a2a",
                  }}>
                    {copied ? "✓ Copied!" : "📋 Copy Text"}
                  </button>
                  <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(caption)}`, "_blank")} style={{
                    flex: 1, padding: "11px",
                    background: "linear-gradient(135deg, #0077b5, #005e94)",
                    color: "#fff", fontSize: "12px", fontWeight: 600, borderRadius: "8px",
                  }}>
                    🔗 Post on LinkedIn
                  </button>
                </div>
              </div>
            )}

            {activeTab === "caption" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#444", textTransform: "uppercase" }}>Generated LinkedIn Post</div>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  style={{
                    background: "#161616", border: "1px solid #252525", borderRadius: "10px",
                    padding: "18px", fontSize: "13px", lineHeight: 1.75,
                    color: "#e0e0e0", minHeight: "340px", resize: "vertical",
                    fontFamily: "inherit", outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleCopyCaption} style={{
                    flex: 1, padding: "11px",
                    background: copied ? "#a3e635" : "#1e1e1e",
                    color: copied ? "#000" : "#f0f0f0",
                    fontSize: "12px", fontWeight: 600, borderRadius: "8px",
                    border: `1px solid ${copied ? "#a3e635" : "#2a2a2a"}`,
                  }}>
                    {copied ? "✓ Copied!" : "📋 Copy Caption"}
                  </button>
                  <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(caption)}`, "_blank")} style={{
                    flex: 1, padding: "11px",
                    background: "linear-gradient(135deg, #0077b5, #005e94)",
                    color: "#fff", fontSize: "12px", fontWeight: 600, borderRadius: "8px",
                  }}>
                    🔗 Post on LinkedIn
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
