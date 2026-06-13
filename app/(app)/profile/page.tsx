"use client";
import { useEffect, useRef, useState } from "react";
import {
  getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, saveProfile, UserProfile, profileCompletionSteps
} from "@/lib/profile";
import { THEMES } from "@/lib/templates";

const SOCIAL_FIELDS = [
  { key: "linkedin",  label: "LinkedIn",  placeholder: "linkedin.com/in/yourname" },
  { key: "twitter",   label: "Twitter/X", placeholder: "twitter.com/yourhandle" },
  { key: "github",    label: "GitHub",    placeholder: "github.com/yourname" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourname" },
  { key: "youtube",   label: "YouTube",   placeholder: "youtube.com/@yourchannel" },
];

const BRAND_COLORS = ["#a3e635","#60a5fa","#c084fc","#fb923c","#f87171","#2dd4bf","#fbbf24","#f472b6"];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "SS";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function stripUrlDisplay(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

function getPreviewTheme(theme: UserProfile["brandTheme"], accent: string) {
  switch (theme) {
    case "light":
      return {
        bg: "linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)",
        panel: "rgba(255,255,255,0.78)",
        border: "rgba(15,23,42,0.08)",
        textPrimary: "#0f172a",
        textSecondary: "rgba(15,23,42,0.62)",
        accentSoft: `${accent}20`,
        overlay: "radial-gradient(circle at top right, rgba(15,23,42,0.06), transparent 36%)",
      };
    case "premium":
      return {
        bg: "linear-gradient(180deg, #09090f 0%, #12111c 100%)",
        panel: "rgba(18,18,24,0.78)",
        border: "rgba(214,184,120,0.18)",
        textPrimary: "#f8f2e7",
        textSecondary: "rgba(248,242,231,0.68)",
        accentSoft: `${accent}24`,
        overlay: "radial-gradient(circle at top right, rgba(214,184,120,0.18), transparent 36%)",
      };
    case "startup":
      return {
        bg: "linear-gradient(180deg, #09090f 0%, #121327 100%)",
        panel: "rgba(18,19,34,0.76)",
        border: "rgba(99,102,241,0.2)",
        textPrimary: "#f8fafc",
        textSecondary: "rgba(248,250,252,0.68)",
        accentSoft: `${accent}24`,
        overlay: "radial-gradient(circle at top right, rgba(99,102,241,0.24), transparent 36%)",
      };
    case "corporate":
      return {
        bg: "linear-gradient(180deg, #0b1220 0%, #162032 100%)",
        panel: "rgba(17,24,39,0.78)",
        border: "rgba(96,165,250,0.18)",
        textPrimary: "#eff6ff",
        textSecondary: "rgba(239,246,255,0.68)",
        accentSoft: `${accent}22`,
        overlay: "radial-gradient(circle at top right, rgba(96,165,250,0.16), transparent 36%)",
      };
    case "modern":
      return {
        bg: "linear-gradient(180deg, #060606 0%, #121212 100%)",
        panel: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.09)",
        textPrimary: "#fafafa",
        textSecondary: "rgba(250,250,250,0.65)",
        accentSoft: `${accent}1e`,
        overlay: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 36%)",
      };
    case "dark":
    default:
      return {
        bg: "linear-gradient(180deg, #070707 0%, #111111 100%)",
        panel: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.09)",
        textPrimary: "#f8fafc",
        textSecondary: "rgba(248,250,252,0.66)",
        accentSoft: `${accent}20`,
        overlay: "radial-gradient(circle at top right, rgba(255,255,255,0.07), transparent 36%)",
      };
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [saved, setSaved] = useState(false);
  const photoRef  = useRef<HTMLInputElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setProfile(loadProfile());
    handler();
    window.addEventListener(PROFILE_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
  }, []);

  const update = (key: keyof UserProfile, value: unknown) =>
    setProfile(p => ({ ...p, [key]: value }));

  const updateSocial = (key: string, value: string) =>
    setProfile(p => ({ ...p, social: { ...p.social, [key]: value } }));

  const handleImageUpload = (file: File, key: "photoUrl" | "logoUrl") => {
    const reader = new FileReader();
    reader.onload = e => update(key, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const steps = profileCompletionSteps(profile);
  const completedCount = steps.filter(s => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);
  const previewAccent = profile.brandColor || "#a3e635";
  const previewTheme = getPreviewTheme(profile.brandTheme, previewAccent);
  const previewName = profile.name || "Your Name";
  const previewRole = profile.headline || profile.role || "Your professional headline";
  const previewCompany = profile.company || "Your company or organization";
  const previewSocials = SOCIAL_FIELDS
    .map((field) => ({ label: field.label, value: (profile.social as Record<string, string>)[field.key] || "" }))
    .filter((item) => item.value);
  const previewStatement = profile.headline || profile.bio || "Your professional headline";
  const previewEyebrow = profile.company
    ? `PROFILE FOR ${profile.company.toUpperCase()}`
    : "PERSONAL BRAND PREVIEW";
  const previewFooterPrimary = profile.company || "SuperSmartX";
  const previewFooterSecondary = stripUrlDisplay(profile.website || previewSocials[0]?.value || "brand-preview");

  const inputStyle: React.CSSProperties = {
    background: "#161616", border: "1px solid #252525",
    borderRadius: "8px", color: "#f0f0f0", padding: "9px 12px",
    width: "100%", fontSize: "13px", outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px", color: "#777", display: "block", marginBottom: "5px",
  };

  return (
    <div style={{ padding: "clamp(16px, 3vw, 32px)" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Brand Profile
          </h1>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            Set this up once to improve autofill, previews, and final output quality everywhere in Create.
          </p>
        </div>
        <button onClick={handleSave} style={{
          padding: "9px 20px",
          background: saved ? "#1a2e0a" : "linear-gradient(135deg,#a3e635,#84cc16)",
          color: saved ? "#a3e635" : "#000",
          fontSize: "13px", fontWeight: 700,
          borderRadius: "8px", border: saved ? "1px solid #a3e635" : "none",
          cursor: "pointer", transition: "all 0.2s",
        }}>
          {saved ? "Saved!" : "Save Brand Profile"}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}>

        {/* Left: Form */}
        <div style={{ flex: "1 1 620px", minWidth: "min(100%, 320px)", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Setup checklist */}
          <div style={{
            background: "#111", border: "1px solid #1a1a1a",
            borderRadius: "12px", padding: "18px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>
                Brand Setup
              </span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#a3e635" }}>{pct}%</span>
            </div>
            <div style={{ background: "#1e1e1e", borderRadius: "4px", height: "4px", marginBottom: "12px" }}>
              <div style={{
                width: `${pct}%`, height: "4px",
                background: "linear-gradient(90deg,#a3e635,#84cc16)",
                borderRadius: "4px", transition: "width 0.4s",
              }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "6px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: s.done ? "#a3e635" : "transparent",
                    border: `1px solid ${s.done ? "#a3e635" : "#333"}`,
                    display: "inline-block",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "11px", color: s.done ? "#888" : "#444" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "16px" }}>
              Basic Info
            </div>

            {/* Photo + Logo uploads */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              {/* Profile photo */}
              <div
                onClick={() => photoRef.current?.click()}
                style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  border: "2px dashed #2a2a2a", cursor: "pointer",
                  overflow: "hidden", background: "#161616",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, position: "relative",
                }}
              >
                {profile.photoUrl
                  ? <img src={profile.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <UploadPlaceholder variant="photo" />
                }
                <div style={{
                  position: "absolute", bottom: "2px", right: "2px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "#a3e635", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px",
                }}>+</div>
              </div>
              <input ref={photoRef} type="file" accept="image/*"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "photoUrl")}
                style={{ display: "none" }} />

              {/* Logo */}
              <div
                onClick={() => logoRef.current?.click()}
                style={{
                  width: "80px", height: "80px", borderRadius: "10px",
                  border: "2px dashed #2a2a2a", cursor: "pointer",
                  overflow: "hidden", background: "#161616",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, position: "relative",
                }}
              >
                {profile.logoUrl
                  ? <img src={profile.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
                  : <UploadPlaceholder variant="logo" />
                }
                <div style={{
                  position: "absolute", bottom: "2px", right: "2px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "#a3e635", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px",
                }}>+</div>
              </div>
              <input ref={logoRef} type="file" accept="image/*"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "logoUrl")}
                style={{ display: "none" }} />

              <div style={{ flex: "1 1 220px", minWidth: "220px" }}>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Profile Photo *</div>
                <div style={{ fontSize: "11px", color: "#444", lineHeight: 1.5 }}>
                  Used on all generated graphics. JPG, PNG, WEBP.
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Display Name *</label>
                <input style={inputStyle} value={profile.name} onChange={e => update("name", e.target.value)}
                  placeholder="Hemant Sharad Patil"
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"} />
              </div>
              <div>
                <label style={labelStyle}>Headline</label>
                <input style={inputStyle} value={profile.headline} onChange={e => update("headline", e.target.value)}
                  placeholder="Software Engineer at Google"
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"} />
              </div>
              <div>
                <label style={labelStyle}>Role / Title *</label>
                <input style={inputStyle} value={profile.role} onChange={e => update("role", e.target.value)}
                  placeholder="Software Engineer"
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"} />
              </div>
              <div>
                <label style={labelStyle}>Company / Organization</label>
                <input style={inputStyle} value={profile.company} onChange={e => update("company", e.target.value)}
                  placeholder="Google"
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, resize: "vertical" }}
                  value={profile.bio}
                  onChange={e => update("bio", e.target.value)}
                  placeholder="Building AI products. 3x founder. Write about startups and code."
                  rows={3}
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={profile.website} onChange={e => update("website", e.target.value)}
                  placeholder="yourwebsite.com"
                  onFocus={e => e.target.style.borderColor = "#a3e635"}
                  onBlur={e => e.target.style.borderColor = "#252525"} />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "16px" }}>
              Social Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {SOCIAL_FIELDS.map(f => (
                <div key={f.key} style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "11px", color: "#666" }}>{f.label}</label>
                  <input style={inputStyle}
                    value={(profile.social as Record<string, string>)[f.key] || ""}
                    onChange={e => updateSocial(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    onFocus={e => e.target.style.borderColor = "#a3e635"}
                    onBlur={e => e.target.style.borderColor = "#252525"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "16px" }}>
              Brand Kit
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Brand Color</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {BRAND_COLORS.map(c => (
                  <div key={c} onClick={() => update("brandColor", c)} style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: c, cursor: "pointer",
                    border: profile.brandColor === c ? "3px solid white" : "3px solid transparent",
                    outline: profile.brandColor === c ? `2px solid ${c}` : "none",
                    transition: "all 0.15s",
                  }} />
                ))}
                <input type="color" value={profile.brandColor}
                  onChange={e => update("brandColor", e.target.value)}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", border: "none", padding: 0, background: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Default Theme</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {THEMES.map(t => (
                  <button key={t} onClick={() => update("brandTheme", t)} style={{
                    padding: "4px 10px", fontSize: "11px", borderRadius: "6px", cursor: "pointer",
                    background: profile.brandTheme === t ? "#a3e635" : "#1a1a1a",
                    color: profile.brandTheme === t ? "#000" : "#888",
                    border: `1px solid ${profile.brandTheme === t ? "#a3e635" : "#2a2a2a"}`,
                    fontWeight: profile.brandTheme === t ? 600 : 400,
                    textTransform: "capitalize",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div style={{ position: "sticky", top: "20px", flex: "1 1 380px", minWidth: "min(100%, 280px)", maxWidth: "460px", width: "100%" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>
            Live Preview
          </div>
          <div style={{
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 0 0 1px #1e1e1e, 0 24px 64px rgba(0,0,0,0.45)",
            background: "#020202",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(circle at 50% 18%, ${previewAccent}12 0%, transparent 22%),
                radial-gradient(circle at 15% 86%, rgba(255,255,255,0.14) 0%, transparent 18%),
                radial-gradient(circle at 86% 80%, rgba(255,255,255,0.10) 0%, transparent 16%),
                radial-gradient(circle at 50% 110%, rgba(255,255,255,0.12) 0%, transparent 24%),
                ${previewTheme.overlay}
              `,
            }} />
            <div style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 0.6px, transparent 1px)",
              backgroundSize: "42px 42px",
            }} />
            <div style={{
              position: "relative",
              padding: "16px 18px 20px",
              aspectRatio: "1 / 1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: previewTheme.textPrimary,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "rgba(18,18,18,0.68)",
                  border: `1px solid ${previewTheme.border}`,
                  color: previewAccent,
                  fontSize: "11px",
                  fontWeight: 700,
                  backdropFilter: "blur(14px)",
                }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: previewAccent, display: "inline-block" }} />
                  SuperSmartX Preview
                </div>
                {profile.logoUrl ? (
                  <div style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${previewTheme.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    backdropFilter: "blur(12px)",
                  }}>
                    <img src={profile.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ) : null}
              </div>

              <div style={{ textAlign: "center", padding: "0 6px" }}>
                <div style={{
                  fontSize: "11px",
                  letterSpacing: "2.8px",
                  color: "rgba(255,255,255,0.52)",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                  fontWeight: 700,
                }}>
                  {previewEyebrow}
                </div>
                <div style={{
                  fontSize: "clamp(19px, 2.7vw, 30px)",
                  lineHeight: 1.12,
                  fontStyle: "italic",
                  color: previewAccent,
                  letterSpacing: "-0.03em",
                  textWrap: "balance",
                  textShadow: `0 0 24px ${previewAccent}16`,
                }}>
                  &quot;{previewStatement}&quot;
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", padding: "0 8px" }}>
                <div style={{
                  width: "min(100%, 260px)",
                  borderRadius: "22px",
                  background: "linear-gradient(180deg, rgba(15,15,15,0.92) 0%, rgba(10,10,10,0.88) 100%)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 18px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
                  padding: "10px",
                  backdropFilter: "blur(16px)",
                }}>
                  <div style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    background: "linear-gradient(180deg, #e9e1df 0%, #d8d1d1 100%)",
                    aspectRatio: "1 / 1.05",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}>
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `radial-gradient(circle at 50% 18%, ${previewAccent}40 0%, ${previewAccent}15 30%, transparent 70%)`,
                        color: "#111",
                        fontSize: "64px",
                        fontWeight: 800,
                        letterSpacing: "-0.05em",
                      }}>
                        {getInitials(previewName)}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "center", padding: "0 8px 4px" }}>
                    <div style={{
                      fontSize: "clamp(22px, 2.8vw, 30px)",
                      lineHeight: 1.06,
                      color: "#fbfbfb",
                      marginBottom: "6px",
                      letterSpacing: "-0.04em",
                      fontFamily: "Georgia, Times New Roman, serif",
                    }}>
                      {previewName}
                    </div>
                    <div style={{
                      fontSize: "clamp(14px, 1.7vw, 18px)",
                      color: "rgba(255,255,255,0.88)",
                      marginBottom: "6px",
                      letterSpacing: "-0.02em",
                    }}>
                      {previewRole}
                    </div>
                    <div style={{
                      fontSize: "clamp(17px, 2vw, 22px)",
                      color: previewTheme.textPrimary,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                    }}>
                      {previewCompany}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", paddingTop: "10px" }}>
                <div style={{
                  fontSize: "clamp(17px, 2.6vw, 24px)",
                  color: "#f7f7f7",
                  letterSpacing: "-0.05em",
                  textShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}>
                  <span style={{ fontWeight: 800 }}>{previewFooterPrimary}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", padding: "0 14px" }}>|</span>
                  <span style={{ fontWeight: 300 }}>{previewFooterSecondary}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "11px", color: "#444", lineHeight: 1.6 }}>
            This preview now reflects your photo, name, role, company, accent color, and brand theme in a poster-style layout.
          </div>
        </div>

      </div>
    </div>
  );
}

function UploadPlaceholder({ variant }: { variant: "photo" | "logo" }) {
  return (
    <div style={{ textAlign: "center", pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
      <div style={{
        width: variant === "photo" ? "22px" : "24px",
        height: variant === "photo" ? "16px" : "20px",
        borderRadius: variant === "photo" ? "6px" : "5px",
        border: "1.5px solid #6a6a6a",
        position: "relative",
      }}>
        {variant === "photo" ? (
          <>
            <span style={{ position: "absolute", width: "4px", height: "4px", borderRadius: "50%", background: "#6a6a6a", top: "3px", right: "4px" }} />
            <span style={{ position: "absolute", left: "3px", right: "3px", bottom: "3px", height: "6px", background: "linear-gradient(135deg, transparent 0 30%, #6a6a6a 30% 62%, transparent 62%)" }} />
          </>
        ) : (
          <>
            <span style={{ position: "absolute", inset: "4px", borderRadius: "3px", background: "#6a6a6a" }} />
            <span style={{ position: "absolute", left: "5px", right: "5px", top: "8px", height: "1px", background: "#161616" }} />
          </>
        )}
      </div>
      <div style={{ fontSize: "8px", color: "#555" }}>{variant === "photo" ? "Photo" : "Logo"}</div>
    </div>
  );
}
