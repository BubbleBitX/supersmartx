"use client";
import React from "react";
import {
  AccentColor,
  ACCENT_COLORS,
  Layout,
  ProfileShape,
  Theme,
  BadgeStyle,
  FontPair,
  FONT_PAIRS,
  LogoPlacement,
  CtaStyle,
  DownloadFormat,
  DOWNLOAD_FORMATS,
  BackgroundPreset,
} from "@/lib/templates";

export interface AchievementCardProps {
  name: string;
  profession: string;
  company: string;
  event: string;
  productIdea: string;
  photoUrl: string | null;
  topLine?: string;
  theme: Theme;
  accentColor: AccentColor;
  profileShape: ProfileShape;
  layout: Layout;
  badgeStyle: BadgeStyle;
  fontPair: FontPair;
  logoPlacement: LogoPlacement;
  ctaStyle: CtaStyle;
  backgroundPreset?: BackgroundPreset;
  backgroundImageUrl?: string | null;
  downloadFormat: DownloadFormat;
  watermark?: boolean;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const THEME_CONFIGS: Record<
  Theme,
  {
    bg: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    overlay: string;
    isDark: boolean;
  }
> = {
  dark: {
    bg: "linear-gradient(150deg, #060608 0%, #0d0d10 50%, #111114 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.10)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.55)",
    overlay: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,255,255,0.07) 0%, transparent 70%)",
    isDark: true,
  },
  light: {
    bg: "linear-gradient(150deg, #f9f9f9 0%, #ffffff 50%, #f2f2f2 100%)",
    cardBg: "rgba(0,0,0,0.04)",
    cardBorder: "rgba(0,0,0,0.09)",
    textPrimary: "#111111",
    textSecondary: "rgba(0,0,0,0.45)",
    overlay: "none",
    isDark: false,
  },
  premium: {
    bg: "linear-gradient(150deg, #08080f 0%, #0f0f1c 50%, #0a0a14 100%)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(200,180,120,0.18)",
    textPrimary: "#f5f0e8",
    textSecondary: "rgba(245,240,232,0.45)",
    overlay: "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(180,150,80,0.10) 0%, transparent 60%)",
    isDark: true,
  },
  startup: {
    bg: "linear-gradient(150deg, #08080e 0%, #10101c 50%, #08080e 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(99,102,241,0.22)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.50)",
    overlay: "radial-gradient(ellipse 60% 50% at 75% 80%, rgba(99,102,241,0.14) 0%, transparent 60%)",
    isDark: true,
  },
  corporate: {
    bg: "linear-gradient(160deg, #0c1118 0%, #161d28 50%, #0c1118 100%)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(56,139,253,0.18)",
    textPrimary: "#e6edf3",
    textSecondary: "rgba(230,237,243,0.45)",
    overlay: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(56,139,253,0.10) 0%, transparent 60%)",
    isDark: true,
  },
  modern: {
    bg: "linear-gradient(150deg, #070707 0%, #111111 50%, #0a0a0a 100%)",
    cardBg: "rgba(255,255,255,0.06)",
    cardBorder: "rgba(255,255,255,0.08)",
    textPrimary: "#fafafa",
    textSecondary: "rgba(250,250,250,0.45)",
    overlay: "radial-gradient(circle 400px at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 100%)",
    isDark: true,
  },
};

const CTA_TEXT: Record<string, string> = {
  follow: "Follow My Journey",
  connect: "Connect With Me",
  building: "Building In Public",
  waitlist: "Join Waitlist",
  none: "",
};

const BADGE_CONFIGS: Record<
  BadgeStyle,
  { padding: string; borderRadius: string; fontSize: string; fontWeight: number; letterSpacing: string }
> = {
  professional: { padding: "3px 10px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, letterSpacing: "2px" },
  modern: { padding: "4px 12px", borderRadius: "20px", fontSize: "9px", fontWeight: 600, letterSpacing: "1.5px" },
  minimal: { padding: "2px 0", borderRadius: "0", fontSize: "9px", fontWeight: 400, letterSpacing: "3px" },
  bold: { padding: "5px 14px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, letterSpacing: "1px" },
};

const BACKGROUND_PRESET_STYLES: Record<
  BackgroundPreset,
  { base: string; overlay: string; detail?: string; opacity?: number }
> = {
  aurora: {
    base: "radial-gradient(circle at 18% 18%, rgba(96,165,250,0.26) 0%, transparent 26%), radial-gradient(circle at 78% 16%, rgba(251,146,60,0.20) 0%, transparent 24%), radial-gradient(circle at 50% 85%, rgba(163,230,53,0.16) 0%, transparent 28%)",
    overlay: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 36%, rgba(0,0,0,0.12) 100%)",
  },
  studio: {
    base: "radial-gradient(circle at 50% 28%, rgba(255,255,255,0.16) 0%, transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 44%)",
    overlay: "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.14) 100%)",
  },
  blueprint: {
    base: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
    overlay: "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    detail: "48px 48px",
    opacity: 0.32,
  },
  sunrise: {
    base: "radial-gradient(circle at 50% 12%, rgba(251,191,36,0.28) 0%, transparent 22%), radial-gradient(circle at 78% 74%, rgba(244,114,182,0.18) 0%, transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.08) 100%)",
    overlay: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 44%, rgba(0,0,0,0.10) 100%)",
  },
  grain: {
    base: "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.08) 0%, transparent 20%), radial-gradient(circle at 84% 72%, rgba(255,255,255,0.06) 0%, transparent 18%)",
    overlay: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.10) 100%)",
  },
};

const STAR_POSITIONS = Array.from({ length: 28 }, (_, index) => ({
  x: ((index * 37 + 11) * 3.7) % 100,
  y: ((index * 53 + 7) * 2.3) % 100,
  r: index % 3 === 0 ? 1 : 0.5,
  o: 0.2 + (index % 5) * 0.08,
}));

export default function AchievementCard({
  name,
  profession,
  company,
  event,
  productIdea,
  photoUrl,
  topLine,
  theme,
  accentColor,
  profileShape,
  layout,
  badgeStyle,
  fontPair,
  logoPlacement,
  ctaStyle,
  backgroundPreset = "aurora",
  backgroundImageUrl,
  downloadFormat,
  watermark,
  cardRef,
}: AchievementCardProps) {
  const tc = THEME_CONFIGS[theme];
  const accent = ACCENT_COLORS[accentColor];
  const fonts = FONT_PAIRS[fontPair];
  const badge = BADGE_CONFIGS[badgeStyle];
  const backgroundStyle = BACKGROUND_PRESET_STYLES[backgroundPreset];
  const fmt = DOWNLOAD_FORMATS.find((format) => format.key === downloadFormat)!;
  const ctaText = CTA_TEXT[ctaStyle];

  const profileRadius =
    profileShape === "circle" ? "50%" :
    profileShape === "rounded" ? "16px" :
    "4px";

  const brandLabel = topLine || "SuperSmartX";
  const mainQuote = event || productIdea || name;
  const width = fmt.displayW;
  const height = fmt.displayH;

  return (
    <div
      ref={cardRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        overflow: "hidden",
        fontFamily: fonts.body,
        background: tc.isDark ? "#050507" : "#fafafa",
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: tc.bg }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: backgroundStyle.base,
          mixBlendMode: tc.isDark ? "screen" : "multiply",
          opacity: 0.95,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: backgroundStyle.overlay,
          backgroundSize: backgroundStyle.detail,
          opacity: backgroundStyle.opacity ?? 1,
        }}
      />

      {backgroundPreset === "grain" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 0.7px, transparent 0.7px)",
            backgroundSize: "18px 18px",
          }}
        />
      )}

      {backgroundImageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(180deg, rgba(5,5,7,0.20) 0%, rgba(5,5,7,0.48) 100%), url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.9,
          }}
        />
      )}

      {tc.overlay !== "none" && (
        <div style={{ position: "absolute", inset: 0, background: tc.overlay }} />
      )}

      {tc.isDark && height > 200 && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {STAR_POSITIONS.map((star, index) => (
            <circle key={index} cx={`${star.x}%`} cy={`${star.y}%`} r={star.r} fill="white" opacity={star.o} />
          ))}
        </svg>
      )}

      {layout === "A" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: height < 250 ? "14px 24px 12px" : "32px 36px 24px",
          }}
        >
          {logoPlacement !== "hidden" && logoPlacement === "top" && (
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px",
                color: tc.textPrimary,
                marginBottom: height < 250 ? "6px" : "10px",
                opacity: 0.9,
              }}
            >
              {brandLabel}
            </div>
          )}

          {height >= 250 && (
            <div
              style={{
                ...badge,
                background: accent.bg,
                border: `1px solid ${accent.primary}40`,
                color: accent.primary,
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              {topLine ? topLine.toUpperCase() : "ACHIEVEMENT"}
            </div>
          )}

          <div
            style={{
              fontFamily: fonts.display,
              fontStyle: fontPair === "classic" || fontPair === "startup" ? "italic" : "normal",
              fontWeight: 700,
              fontSize: height < 250 ? "14px" : mainQuote.length > 40 ? "17px" : "20px",
              color: accent.primary,
              textAlign: "center",
              lineHeight: 1.3,
              marginBottom: height < 250 ? "8px" : "18px",
              maxWidth: `${width - 60}px`,
            }}
          >
            &quot;{mainQuote}&quot;
          </div>

          {height >= 250 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "132px",
                  height: "164px",
                  borderRadius: profileRadius,
                  overflow: "hidden",
                  background: tc.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  border: `1px solid ${tc.cardBorder}`,
                  boxShadow: `0 22px 50px ${tc.isDark ? "rgba(0,0,0,0.34)" : "rgba(0,0,0,0.12)"}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "10px 10px auto auto",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: `${accent.primary}18`,
                    border: `1px solid ${accent.primary}42`,
                    backdropFilter: "blur(8px)",
                    zIndex: 1,
                  }}
                />
                {photoUrl ? (
                  <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "36px" }}>
                    {"\u{1F464}"}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: tc.textPrimary, textAlign: "center" }}>
                  {name || "Your Name"}
                </div>
                <div style={{ fontSize: "11px", color: tc.textSecondary, textAlign: "center", letterSpacing: "0.03em" }}>
                  {profession}
                </div>
                {company && <div style={{ fontSize: "11px", color: tc.textSecondary, textAlign: "center" }}>{company}</div>}
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {ctaText && height >= 250 && (
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                color: accent.primary,
                border: `1px solid ${accent.primary}50`,
                borderRadius: "20px",
                padding: "4px 12px",
                marginBottom: "10px",
              }}
            >
              {ctaText}
            </div>
          )}

          {logoPlacement === "bottom" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderTop: `1px solid ${tc.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                paddingTop: height < 250 ? "8px" : "14px",
                width: "100%",
                fontSize: height < 250 ? "12px" : "15px",
                fontWeight: 700,
                color: tc.textPrimary,
                letterSpacing: "-0.3px",
              }}
            >
              {brandLabel}
            </div>
          )}
        </div>
      )}

      {layout === "B" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: height < 250 ? "12px 20px" : "28px 32px 20px",
          }}
        >
          {logoPlacement === "top" && (
            <div style={{ fontSize: "12px", fontWeight: 700, color: tc.textPrimary, marginBottom: "12px" }}>{brandLabel}</div>
          )}
          <div style={{ display: "flex", gap: "20px", flex: 1 }}>
            <div
              style={{
                width: height < 250 ? "80px" : "120px",
                height: height < 250 ? "100%" : "150px",
                borderRadius: profileRadius,
                overflow: "hidden",
                background: tc.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                border: `1px solid ${tc.cardBorder}`,
                flexShrink: 0,
              }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "30px" }}>
                  {"\u{1F464}"}
                </div>
              )}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
              {height >= 250 && (
                <div
                  style={{
                    ...badge,
                    background: accent.bg,
                    border: `1px solid ${accent.primary}40`,
                    color: accent.primary,
                    textTransform: "uppercase",
                    display: "inline-block",
                    width: "fit-content",
                  }}
                >
                  {topLine || "Achievement"}
                </div>
              )}
              <div
                style={{
                  fontFamily: fonts.display,
                  fontStyle: fontPair === "classic" || fontPair === "startup" ? "italic" : "normal",
                  fontSize: height < 250 ? "13px" : mainQuote.length > 35 ? "15px" : "17px",
                  fontWeight: 700,
                  color: accent.primary,
                  lineHeight: 1.35,
                }}
              >
                &quot;{mainQuote}&quot;
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: tc.textPrimary }}>{name || "Your Name"}</div>
              <div style={{ fontSize: "12px", color: tc.textSecondary }}>{profession}{company ? ` · ${company}` : ""}</div>
              {ctaText && height >= 250 && (
                <div
                  style={{
                    fontSize: "10px",
                    color: accent.primary,
                    border: `1px solid ${accent.primary}50`,
                    borderRadius: "20px",
                    padding: "3px 10px",
                    width: "fit-content",
                  }}
                >
                  {ctaText}
                </div>
              )}
            </div>
          </div>
          {logoPlacement === "bottom" && (
            <div
              style={{
                borderTop: `1px solid ${tc.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                paddingTop: "12px",
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: 700,
                color: tc.textPrimary,
                textAlign: "center",
              }}
            >
              {brandLabel}
            </div>
          )}
        </div>
      )}

      {layout === "C" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: height < 250 ? "12px 20px" : "32px",
            gap: height < 250 ? "6px" : "12px",
          }}
        >
          {logoPlacement === "top" && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: 0,
                right: 0,
                textAlign: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: tc.textPrimary,
              }}
            >
              {brandLabel}
            </div>
          )}
          {photoUrl && height >= 250 && (
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: profileRadius,
                overflow: "hidden",
                border: `2px solid ${accent.primary}`,
              }}
            >
              <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div
            style={{
              fontSize: height < 250 ? "10px" : "11px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: accent.primary,
              fontWeight: 600,
            }}
          >
            {topLine || "Achievement Unlocked"}
          </div>
          <div
            style={{
              fontFamily: fonts.display,
              fontStyle: fontPair === "classic" || fontPair === "startup" ? "italic" : "normal",
              fontSize: height < 250 ? "15px" : mainQuote.length > 40 ? "18px" : "22px",
              fontWeight: 700,
              color: tc.textPrimary,
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: `${width - 60}px`,
            }}
          >
            {mainQuote}
          </div>
          {height >= 250 && (
            <>
              <div style={{ fontSize: "15px", fontWeight: 700, color: tc.textPrimary }}>{name}</div>
              <div style={{ fontSize: "12px", color: tc.textSecondary }}>{profession}{company ? ` · ${company}` : ""}</div>
              {ctaText && (
                <div
                  style={{
                    fontSize: "10px",
                    color: accent.primary,
                    border: `1px solid ${accent.primary}50`,
                    borderRadius: "20px",
                    padding: "4px 12px",
                    marginTop: "4px",
                  }}
                >
                  {ctaText}
                </div>
              )}
            </>
          )}
          {logoPlacement === "bottom" && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: "center",
                borderTop: `1px solid ${tc.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                padding: "12px",
                fontSize: "13px",
                fontWeight: 700,
                color: tc.textPrimary,
              }}
            >
              {brandLabel}
            </div>
          )}
        </div>
      )}

      {watermark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "12px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.35)",
              background: "rgba(0,0,0,0.35)",
              padding: "3px 8px",
              borderRadius: "4px",
              backdropFilter: "blur(4px)",
              letterSpacing: "0.5px",
            }}
          >
            supersmartx
          </div>
        </div>
      )}
    </div>
  );
}
