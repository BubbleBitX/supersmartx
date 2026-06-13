"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  getEventsByCategory,
  EventCategorySlug,
  EventType,
  interpolate,
} from "@/lib/events/categories";
import {
  PLATFORMS,
  DEFAULT_PLATFORMS,
  VOICE_OPTIONS,
  MOOD_OPTIONS,
  PlatformSlug,
  Voice,
  Mood,
  OutputType,
  TextOutputType,
} from "@/lib/platforms";
import { generatePlatformCaption, PlatformContent } from "@/lib/platforms/caption-engine";
import {
  ACCENT_COLORS,
  THEMES,
  TEMPLATES,
  LAYOUTS,
  PROFILE_SHAPES,
  BADGE_STYLES,
  FONT_PAIRS,
  LOGO_PLACEMENTS,
  CTA_STYLES,
  DOWNLOAD_FORMATS,
  AccentColor,
  Theme,
  ProfileShape,
  Layout,
  BadgeStyle,
  FontPair,
  LogoPlacement,
  CtaStyle,
  DownloadFormat,
} from "@/lib/templates";
import { getEmptyProfile, loadProfile, PROFILE_UPDATED_EVENT, profileCompletionSteps, UserProfile } from "@/lib/profile";
import { getCreateHrefForTemplateId, getEventTypeIdForTemplateId } from "@/lib/routing";
import { loadTimeline, saveToTimeline } from "@/lib/timeline";
import AchievementCard from "@/components/AchievementCard";

type Step = "entry" | "category" | "event" | "platforms" | "form" | "style" | "output";
type ProgressStepKey = Step | "template";
type ProgressStep = { key: ProgressStepKey; label: string; num: number };

const PLATFORM_PRESETS: Array<{ key: string; label: string; hint: string; platforms: PlatformSlug[] }> = [
  { key: "starter", label: "Starter", hint: "LinkedIn + X for fast personal posts", platforms: ["linkedin", "twitter"] },
  { key: "visual", label: "Visual", hint: "LinkedIn + Instagram for graphic-first sharing", platforms: ["linkedin", "instagram"] },
  { key: "community", label: "Community", hint: "Threads + Reddit + Discord for discussion", platforms: ["threads", "reddit", "discord"] },
  { key: "launch", label: "Launch", hint: "Product Hunt + LinkedIn + X for launches", platforms: ["producthunt", "linkedin", "twitter"] },
];

const DEFAULT_PROGRESS_STEPS: ProgressStep[] = [
  { key: "category", label: "Category", num: 1 },
  { key: "event", label: "Event", num: 2 },
  { key: "platforms", label: "Platforms", num: 3 },
  { key: "form", label: "Details", num: 4 },
  { key: "style", label: "Style", num: 5 },
  { key: "output", label: "Generate", num: 6 },
];

const TEMPLATE_PROGRESS_STEPS: ProgressStep[] = [
  { key: "template", label: "Template", num: 1 },
  { key: "form", label: "Details", num: 2 },
  { key: "style", label: "Style", num: 3 },
  { key: "output", label: "Generate", num: 4 },
];

const PLATFORM_DEFAULT_FORMAT: Partial<Record<PlatformSlug, DownloadFormat>> = {
  linkedin: "linkedin",
  twitter: "twitter",
  instagram: "instagram",
  threads: "square",
  reddit: "square",
  producthunt: "square",
  indiehackers: "square",
  hackernews: "square",
  github: "square",
  devto: "square",
  discord: "square",
  substack: "square",
};

const OUTPUT_TYPE_LABELS: Record<TextOutputType, string> = {
  caption: "Caption",
  title: "Title",
  body: "Body",
  tagline: "Tagline",
  description: "Description",
  outline: "Outline",
  announcement: "Announcement",
};

export default function CreateFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get("template");
  const reuseEventId = searchParams.get("reuse");
  const requestedEventTypeId = searchParams.get("eventType")
    || (selectedTemplateId ? getEventTypeIdForTemplateId(selectedTemplateId) : null);
  const initialEvent = requestedEventTypeId
    ? EVENT_TYPES.find((eventType) => eventType.id === requestedEventTypeId) ?? null
    : null;
  const initialCategory = initialEvent?.category || (searchParams.get("category") as EventCategorySlug) || null;
  const cameFromTemplate = !!selectedTemplateId;
  const hasDirectCreateIntent = !!selectedTemplateId || !!requestedEventTypeId || !!initialCategory;

  const [step, setStep] = useState<Step>(() => {
    if (!hasDirectCreateIntent) return "entry";
    if (initialEvent) return "form";
    if (initialCategory) return "event";
    return "category";
  });
  const [selectedCategory, setCategory] = useState<EventCategorySlug | null>(initialCategory);
  const [selectedEvent, setEvent] = useState<EventType | null>(initialEvent);
  const [selectedPlatforms, setPlatforms] = useState<PlatformSlug[]>(DEFAULT_PLATFORMS);
  const [profile, setProfile] = useState<UserProfile>(getEmptyProfile);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    name: "",
    role: "",
    company: "",
  });

  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColor] = useState<AccentColor>("lime");
  const [profileShape, setProfileShape] = useState<ProfileShape>("rounded");
  const [layout, setLayout] = useState<Layout>("A");
  const [badgeStyle, setBadgeStyle] = useState<BadgeStyle>("professional");
  const [fontPair, setFontPair] = useState<FontPair>("classic");
  const [logoPlacement, setLogoPlacement] = useState<LogoPlacement>("bottom");
  const [ctaStyle, setCtaStyle] = useState<CtaStyle>("follow");
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("square");
  const [voice, setVoice] = useState<Voice>("professional");
  const [mood, setMood] = useState<Mood>("achievement");
  const [watermark] = useState(false);

  const [captions, setCaptions] = useState<Partial<Record<PlatformSlug, PlatformContent>>>({});
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformSlug>("linkedin");
  const [activeGraphicPlatform, setActiveGraphicPlatform] = useState<PlatformSlug>("linkedin");
  const [activeOutputTab, setActiveOutputTab] = useState<"graphic" | "captions">("graphic");
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncProfile = () => {
      const nextProfile = loadProfile();
      setProfile(nextProfile);
      setFormValues((prev) => ({
        ...prev,
        name: prev.name || nextProfile.name || "",
        role: prev.role || nextProfile.role || "",
        company: prev.company || nextProfile.company || "",
      }));
      setTheme((prev) => (prev === "dark" ? (nextProfile.brandTheme || "dark") : prev));
    };

    syncProfile();
    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
  }, []);

  useEffect(() => {
    if (!reuseEventId) return;

    const timelineEvent = loadTimeline().find((event) => event.id === reuseEventId);
    if (!timelineEvent) return;

    const reusedEvent = EVENT_TYPES.find((eventType) => eventType.id === timelineEvent.eventTypeId);
    if (!reusedEvent) return;

    const validPlatforms = timelineEvent.platforms.filter((platform): platform is PlatformSlug =>
      PLATFORMS.some((candidate) => candidate.slug === platform)
    );

    setCategory(reusedEvent.category);
    setEvent(reusedEvent);
    setPlatforms(validPlatforms.length > 0 ? validPlatforms : DEFAULT_PLATFORMS);
    setFormValues((current) => ({ ...current, ...timelineEvent.values }));
    setActivePlatformTab(validPlatforms[0] || "linkedin");
    setStep("form");
  }, [reuseEventId]);

  const handleFormBack = () => {
    if (cameFromTemplate) {
      router.push("/templates");
      return;
    }
    setStep("platforms");
  };

  const handleCreateNewEvent = () => {
    if (cameFromTemplate) {
      router.push("/create");
      return;
    }
    setStep("entry");
    setEvent(null);
    setCategory(null);
    setPlatforms(DEFAULT_PLATFORMS);
  };

  const progressSteps = cameFromTemplate ? TEMPLATE_PROGRESS_STEPS : DEFAULT_PROGRESS_STEPS;
  const currentProgressKey: ProgressStepKey = cameFromTemplate
    ? (step === "style" || step === "output" ? step : "form")
    : (step === "entry" ? "category" : step);

  const handleProgressStepClick = (key: ProgressStepKey) => {
    if (key === "template") {
      router.push("/templates");
      return;
    }
    setStep(key as Step);
  };

  const eventOptions = selectedCategory ? getEventOptionsForCategory(selectedCategory) : [];
  const graphicPlatforms = selectedPlatforms.filter((slug) => supportsGraphicPreview(slug));
  const hasGraphicOutputs = graphicPlatforms.length > 0;
  const activeGraphicMeta = PLATFORMS.find((platform) => platform.slug === activeGraphicPlatform && supportsGraphicPreview(platform.slug))
    || (graphicPlatforms[0] ? PLATFORMS.find((platform) => platform.slug === graphicPlatforms[0]) : null)
    || null;
  const activePlatformMeta = PLATFORMS.find((platform) => platform.slug === activePlatformTab)
    || (selectedPlatforms[0] ? PLATFORMS.find((platform) => platform.slug === selectedPlatforms[0]) : null)
    || PLATFORMS[0];
  const activePlatformContent = captions[activePlatformMeta.slug] || {};
  const activeTextOutputs = getTextOutputTypes(activePlatformMeta.outputTypes);
  const activePrimaryOutput = getPrimaryTextOutputType(activePlatformMeta.slug);
  const activePrimaryContent = activePlatformContent[activePrimaryOutput] || "";
  const activePrimaryLimit = getFieldLimit(activePlatformMeta.slug, activePrimaryOutput);
  const activePrimaryOverLimit = !!activePrimaryLimit && activePrimaryContent.length > activePrimaryLimit;
  const outputTabs = (hasGraphicOutputs ? ["graphic", "captions"] : ["captions"]) as Array<"graphic" | "captions">;

  const setPlatformPreview = (slug: PlatformSlug) => {
    if (!supportsGraphicPreview(slug)) return;
    setActiveGraphicPlatform(slug);
    setDownloadFormat(getDefaultFormatForPlatform(slug));
  };

  const handleGenerate = () => {
    if (!selectedEvent) return;

    const platformObjs = PLATFORMS.filter((platform) => selectedPlatforms.includes(platform.slug));
    const generated: Partial<Record<PlatformSlug, PlatformContent>> = {};
    const timelineCaptions: Record<string, string> = {};

    for (const platform of platformObjs) {
      const result = generatePlatformCaption({
        event: selectedEvent,
        values: formValues,
        platform,
        voice,
        mood,
      });

      generated[platform.slug] = result.outputs;
      timelineCaptions[platform.slug] = serializePlatformContent(platform.slug, result.outputs);
    }

    setCaptions(generated);
    setActivePlatformTab(selectedPlatforms[0]);
    if (graphicPlatforms[0]) setPlatformPreview(graphicPlatforms[0]);
    setActiveOutputTab(graphicPlatforms.length > 0 ? "graphic" : "captions");

    const categoryMeta = EVENT_CATEGORIES.find((item) => item.slug === selectedEvent.category)!;
    saveToTimeline({
      id: `${selectedEvent.id}_${Date.now()}`,
      eventTypeId: selectedEvent.id,
      eventTypeLabel: selectedEvent.label,
      eventTypeIcon: selectedEvent.icon,
      category: categoryMeta.slug,
      categoryColor: categoryMeta.color,
      title: interpolate(selectedEvent.cardHeadline, formValues),
      values: formValues,
      platforms: selectedPlatforms,
      captions: timelineCaptions,
      createdAt: new Date().toISOString(),
    });

    setStep("output");
  };

  const fmt = DOWNLOAD_FORMATS.find((format) => format.key === downloadFormat)!;
  const selectedPlatformSet = new Set(selectedPlatforms);
  const requiredFields = selectedEvent?.fields.filter((field) => field.required) || [];
  const missingRequiredFields = requiredFields.filter((field) => !(formValues[field.key] || "").trim());
  const hasMissingRequiredFields = missingRequiredFields.length > 0;
  const profileSeededCount = selectedEvent
    ? ["name", "role", "company"].filter((key) => selectedEvent.fields.some((field) => field.key === key) && (formValues[key] || "").trim()).length
    : 0;
  const profileSteps = profileCompletionSteps(profile);
  const profileCompletionPct = Math.round((profileSteps.filter((stepItem) => stepItem.done).length / profileSteps.length) * 100);
  const featuredTemplates = TEMPLATES.slice(0, 4);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const scale = Math.max(fmt.width / fmt.displayW, fmt.height / fmt.displayH);
      const dataUrl = await toPng(cardRef.current, {
        width: fmt.width,
        height: fmt.height,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `${selectedEvent?.id || "announcement"}-${downloadFormat}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadFormat, fmt, selectedEvent]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const cardProps = {
    name: formValues.name || profile.name || "",
    profession: formValues.role || profile.role || "",
    company: formValues.company || profile.company || "",
    event: pickFirst(formValues, ["achievement", "event", "position", "price", "milestone", "date_time"], formValues.company || ""),
    productIdea: pickFirst(formValues, ["product_idea", "context", "skills", "abstract", "investors", "what_next", "website", "join_link"]),
    topLine: pickFirst(formValues, ["organizers", "website", "register_link", "subscribe_link", "github_url", "join_link", "platform"], formValues.company || ""),
    photoUrl: profile.photoUrl,
    theme,
    accentColor,
    profileShape,
    layout,
    badgeStyle,
    fontPair,
    logoPlacement,
    ctaStyle,
    downloadFormat,
    watermark,
    cardRef,
  };

  const previewScale = Math.min(1, 340 / fmt.displayW);
  const previewFrameHeight = Math.max(160, Math.round(fmt.displayH * previewScale));
  const currentStepNum = Math.max(1, progressSteps.findIndex((item) => item.key === currentProgressKey) + 1);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {step !== "entry" && (
      <div style={{
        padding: "14px clamp(16px, 3vw, 32px)",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        background: "#0e0e0e",
        flexShrink: 0,
        overflowX: "auto",
      }}>
        {progressSteps.map((item, index) => {
          const stepNumber = index + 1;
          const done = stepNumber < currentStepNum;
          const active = item.key === currentProgressKey;

          return (
            <div key={item.key} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => (done ? handleProgressStepClick(item.key) : undefined)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: done ? "pointer" : "default",
                  opacity: done || active ? 1 : 0.35,
                }}
              >
                <div style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: done ? "#a3e635" : active ? "#1e1e1e" : "#141414",
                  border: `1px solid ${done ? "#a3e635" : active ? "#a3e635" : "#252525"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: done ? "#000" : active ? "#a3e635" : "#555",
                }}>
                  {done ? <StepDoneDot /> : item.num}
                </div>
                <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? "#f0f0f0" : "#555" }}>
                  {item.label}
                </span>
              </div>
              {index < progressSteps.length - 1 && (
                <div style={{ width: "24px", height: "1px", background: done ? "#a3e635" : "#1e1e1e", margin: "0 6px" }} />
              )}
            </div>
          );
        })}
      </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "28px clamp(16px, 3vw, 32px) 36px" }}>
        {step === "entry" && (
          <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
            {profileCompletionPct < 100 && (
              <div style={{
                background: "#111",
                border: "1px solid #1e2a12",
                borderLeft: "3px solid #a3e635",
                borderRadius: "14px",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "4px" }}>
                    Complete your brand profile for stronger previews
                  </div>
                  <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.55 }}>
                    {profileCompletionPct}% complete. Photo, role, company, and brand details improve autofill and final output quality.
                  </div>
                </div>
                <button
                  onClick={() => router.push("/profile")}
                  style={{
                    padding: "8px 14px",
                    background: "#a3e635",
                    color: "#000",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Complete Brand Profile
                </button>
              </div>
            )}
            <div style={{ marginBottom: "28px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 12px",
                borderRadius: "999px",
                background: "#111",
                border: "1px solid #1e1e1e",
                color: "#a3e635",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "14px",
              }}>
                Quick Start
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 8px", letterSpacing: "-0.04em" }}>
                Choose how you want to create
              </h2>
              <p style={{ fontSize: "14px", color: "#666", margin: 0, lineHeight: 1.65, maxWidth: "720px" }}>
                Start from a proven template for speed, or build from category if you want more control over the event structure.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <button
                onClick={() => setStep("category")}
                style={{
                  textAlign: "left",
                  padding: "22px",
                  borderRadius: "18px",
                  background: "linear-gradient(180deg, rgba(163,230,53,0.08) 0%, #111 100%)",
                  border: "1px solid #314415",
                  cursor: "pointer",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <EntryModeGlyph kind="manual" />
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f0f0f0", marginBottom: "6px" }}>
                  Start manually
                </div>
                <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, marginBottom: "12px" }}>
                  Pick a category, choose the exact event type, then generate platform-aware content.
                </div>
                <div style={{ fontSize: "11px", color: "#a3e635", fontWeight: 700 }}>
                  Best for custom announcements and flexible workflows {"->"}
                </div>
              </button>

              <button
                onClick={() => router.push("/templates")}
                style={{
                  textAlign: "left",
                  padding: "22px",
                  borderRadius: "18px",
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  cursor: "pointer",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <EntryModeGlyph kind="template" />
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f0f0f0", marginBottom: "6px" }}>
                  Start from a template
                </div>
                <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.6, marginBottom: "12px" }}>
                  Use a ready-made structure like hackathon selection, product launch, certification, or newsletter.
                </div>
                <div style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700 }}>
                  Best for faster creation with less setup {"->"}
                </div>
              </button>
            </div>

            <div style={{
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: "16px",
              padding: "18px",
            }}>
              <div style={{ fontSize: "11px", color: "#777", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                Popular shortcuts
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {EVENT_CATEGORIES.slice(0, 4).map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => {
                      setCategory(category.slug);
                      setStep("event");
                    }}
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "#151515",
                      border: "1px solid #202020",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "18px", marginBottom: "8px" }}>{category.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f0f0", marginBottom: "4px" }}>
                      {category.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.55 }}>
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: "16px",
              padding: "18px",
              marginTop: "16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#777", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Featured Templates
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Templates are the fastest path inside Create when you already know the post format.
                  </div>
                </div>
                <button
                  onClick={() => router.push("/templates")}
                  style={{
                    padding: "8px 14px",
                    background: "#161616",
                    color: "#f0f0f0",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "1px solid #2a2a2a",
                    cursor: "pointer",
                  }}
                >
                  Open Template Library
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {featuredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => router.push(getCreateHrefForTemplateId(template.id))}
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "#151515",
                      border: "1px solid #202020",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f0f0f0", marginBottom: "5px" }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.55, marginBottom: "8px" }}>
                      {template.fields.filter((field) => field.required).length} required fields
                    </div>
                    <div style={{ fontSize: "10px", color: "#60a5fa", fontWeight: 700 }}>
                      Use this template
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "category" && (
          <div style={{ maxWidth: "1120px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 4px" }}>
              What are you sharing?
            </h2>
            <p style={{ fontSize: "13px", color: "#555", margin: "0 0 24px" }}>
              Select a category to get started
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              {EVENT_CATEGORIES.map((category) => (
                <div
                  key={category.slug}
                  onClick={() => {
                    setCategory(category.slug);
                    setEvent(null);
                    setStep("event");
                  }}
                  style={{
                    padding: "18px 18px 16px",
                    borderRadius: "16px",
                    background: `linear-gradient(180deg, ${selectedCategory === category.slug ? `${category.color}12` : "rgba(255,255,255,0.03)"} 0%, #111 100%)`,
                    border: `1px solid ${selectedCategory === category.slug ? `${category.color}60` : "#1a1a1a"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: selectedCategory === category.slug ? `0 0 20px ${category.color}15` : "none",
                    minHeight: "174px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(event) => {
                    const node = event.currentTarget as HTMLDivElement;
                    node.style.borderColor = `${category.color}50`;
                    node.style.background = "#161616";
                  }}
                  onMouseLeave={(event) => {
                    const node = event.currentTarget as HTMLDivElement;
                    node.style.borderColor = selectedCategory === category.slug ? `${category.color}60` : "#1a1a1a";
                    node.style.background = selectedCategory === category.slug
                      ? `linear-gradient(180deg, ${category.color}12 0%, #111 100%)`
                      : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, #111 100%)";
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "12px" }}>{category.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f0f0", marginBottom: "6px" }}>{category.label}</div>
                  <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.5 }}>{category.description}</div>
                  <div style={{ marginTop: "auto", paddingTop: "14px", fontSize: "10px", color: category.color, fontWeight: 700, letterSpacing: "0.02em" }}>
                    {getEventsByCategory(category.slug).length} event types →
                    <span style={{ display: "block", opacity: 0.72, marginTop: "4px" }}>Custom option available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "event" && selectedCategory && (
          <div style={{ maxWidth: "980px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <button onClick={() => setStep("category")} style={backButtonStyle}>
                ← Back
              </button>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>
                  {EVENT_CATEGORIES.find((item) => item.slug === selectedCategory)?.icon}{" "}
                  {EVENT_CATEGORIES.find((item) => item.slug === selectedCategory)?.label}
                </h2>
                <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>Select the event type</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
              {eventOptions.map((eventType) => (
                <div
                  key={eventType.id}
                  onClick={() => {
                    setEvent(eventType);
                    setStep("platforms");
                  }}
                  style={{
                    padding: "16px 16px 14px",
                    borderRadius: "14px",
                    background: eventType.id.startsWith("custom-")
                      ? "linear-gradient(180deg, rgba(163,230,53,0.10) 0%, #111 100%)"
                      : "#111",
                    border: `1px solid ${selectedEvent?.id === eventType.id ? "#a3e635" : eventType.id.startsWith("custom-") ? "#304217" : "#1a1a1a"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minHeight: "148px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(event) => {
                    const node = event.currentTarget as HTMLDivElement;
                    node.style.borderColor = "#a3e63560";
                    node.style.background = "#161616";
                  }}
                  onMouseLeave={(event) => {
                    const node = event.currentTarget as HTMLDivElement;
                    node.style.borderColor = selectedEvent?.id === eventType.id ? "#a3e635" : eventType.id.startsWith("custom-") ? "#304217" : "#1a1a1a";
                    node.style.background = eventType.id.startsWith("custom-")
                      ? "linear-gradient(180deg, rgba(163,230,53,0.10) 0%, #111 100%)"
                      : "#111";
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>{eventType.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f0f0f0", marginBottom: "6px" }}>{eventType.label}</div>
                  <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.45 }}>
                    {eventType.id.startsWith("custom-")
                      ? "Build your own announcement with flexible fields for title, story, and CTA."
                      : interpolate(eventType.baseSummary, {
                        name: "Your Name",
                        company: "your company",
                        achievement: "your milestone",
                        role: "your role",
                      })}
                  </div>
                  <div style={{ fontSize: "10px", color: eventType.id.startsWith("custom-") ? "#a3e635" : "#555", marginTop: "auto", paddingTop: "12px", fontWeight: eventType.id.startsWith("custom-") ? 700 : 500 }}>
                    {eventType.fields.filter((field) => field.required).length} required fields
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "platforms" && (
          <div style={{ maxWidth: "980px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <button onClick={() => setStep("event")} style={backButtonStyle}>
                ← Back
              </button>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>Where are you sharing?</h2>
                <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>Select all platforms and we will generate native output for each</p>
              </div>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "11px", color: "#777", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                Recommended presets
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                {PLATFORM_PRESETS.map((preset) => {
                  const isActive = preset.platforms.length === selectedPlatforms.length
                    && preset.platforms.every((platform) => selectedPlatformSet.has(platform));
                  return (
                    <button
                      key={preset.key}
                      onClick={() => setPlatforms(preset.platforms)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: isActive ? "#141e08" : "#111",
                        border: `1px solid ${isActive ? "#a3e635" : "#1a1a1a"}`,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 700, color: isActive ? "#f0f0f0" : "#d0d0d0", marginBottom: "4px" }}>
                        {preset.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.5, marginBottom: "7px" }}>
                        {preset.hint}
                      </div>
                      <div style={{ fontSize: "10px", color: isActive ? "#a3e635" : "#555" }}>
                        {preset.platforms.map((slug) => PLATFORMS.find((platform) => platform.slug === slug)?.label).join(" / ")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {PLATFORMS.map((platform) => {
                const selected = selectedPlatforms.includes(platform.slug);
                return (
                  <div
                    key={platform.slug}
                    onClick={() => {
                      setPlatforms((current) =>
                        current.includes(platform.slug)
                          ? current.length > 1 ? current.filter((item) => item !== platform.slug) : current
                          : [...current, platform.slug]
                      );
                    }}
                    style={{
                      padding: "14px 15px",
                      borderRadius: "14px",
                      background: selected ? "#141e08" : "#111",
                      border: `1px solid ${selected ? "#a3e635" : "#1a1a1a"}`,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      minHeight: "92px",
                    }}
                  >
                    <span style={{ fontSize: "18px", marginTop: "1px" }}>{platform.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: selected ? 700 : 500, color: selected ? "#f0f0f0" : "#888", marginBottom: "4px" }}>
                        {platform.label}
                      </div>
                      <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.45, marginBottom: "6px" }}>
                        {platform.description}
                      </div>
                      <div style={{ fontSize: "9px", color: "#444" }}>
                        {platform.outputTypes.join(" + ")}
                      </div>
                    </div>
                    {selected && (
                      <div style={{ marginLeft: "auto", color: "#a3e635", fontSize: "12px" }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep("form")} style={primaryButtonStyle}>
                Continue with {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""} →
              </button>
            </div>
          </div>
        )}

        {step === "form" && selectedEvent && (
          <div style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <button onClick={handleFormBack} style={backButtonStyle}>
                ← Back
              </button>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>
                  {selectedEvent.icon} {selectedEvent.label}
                </h2>
                <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>Fill in the details</p>
              </div>
            </div>
            <div style={{
              background: "#111",
              border: `1px solid ${hasMissingRequiredFields ? "#3a2222" : "#1e2a12"}`,
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "16px",
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: hasMissingRequiredFields ? "#fca5a5" : "#a3e635", marginBottom: "4px" }}>
                {hasMissingRequiredFields
                  ? `Complete ${missingRequiredFields.length} more required field${missingRequiredFields.length > 1 ? "s" : ""} to continue`
                  : "Required fields complete"}
              </div>
              <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.55 }}>
                {hasMissingRequiredFields
                  ? missingRequiredFields.map((field) => field.label).join(" / ")
                  : "You can move to style now. Name, role, and company are auto-filled from your profile when available."}
              </div>
              {profileSeededCount > 0 && (
                <div style={{ fontSize: "10px", color: "#555", marginTop: "8px" }}>
                  {profileSeededCount} field{profileSeededCount > 1 ? "s were" : " was"} auto-filled from your profile.
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {selectedEvent.fields.map((field) => (
                <div key={field.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={{ fontSize: "11px", color: "#777" }}>
                      {field.label} {field.required && <span style={{ color: "#f87171" }}>*</span>}
                    </label>
                    <span style={{ fontSize: "9px", color: "#444" }}>
                      {(formValues[field.key] || "").length}/{field.maxLength}
                    </span>
                  </div>
                  {field.hint && (
                    <div style={{ fontSize: "10px", color: "#555", marginBottom: "5px" }}>{field.hint}</div>
                  )}
                  {field.type === "textarea" ? (
                    <textarea
                      value={formValues[field.key] || ""}
                      onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      rows={3}
                      style={inputStyle}
                      onFocus={(event) => { event.target.style.borderColor = "#a3e635"; }}
                      onBlur={(event) => { event.target.style.borderColor = "#252525"; }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formValues[field.key] || ""}
                      onChange={(event) => setFormValues((current) => ({ ...current, [field.key]: event.target.value }))}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      style={{ ...inputStyle, resize: undefined }}
                      onFocus={(event) => { event.target.style.borderColor = "#a3e635"; }}
                      onBlur={(event) => { event.target.style.borderColor = "#252525"; }}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  if (hasMissingRequiredFields) return;
                  setStep("style");
                }}
                disabled={hasMissingRequiredFields}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  opacity: hasMissingRequiredFields ? 0.45 : 1,
                  cursor: hasMissingRequiredFields ? "not-allowed" : "pointer",
                }}
              >
                {hasMissingRequiredFields ? "Complete required fields to continue" : "Continue to Style →"}
              </button>
            </div>
          </div>
        )}

        {step === "style" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "1120px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <button onClick={() => setStep("form")} style={backButtonStyle}>
                  ← Back
                </button>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0f0", margin: 0 }}>Customize the Style</h2>
                  <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>One-click customization</p>
                </div>
              </div>

              <StyleSection label="Voice">
                <BtnGroup options={VOICE_OPTIONS.map((item) => ({ key: item.key, label: item.label }))} value={voice} onChange={(value) => setVoice(value as Voice)} />
              </StyleSection>
              <StyleSection label="Mood">
                <BtnGroup options={MOOD_OPTIONS.map((item) => ({ key: item.key, label: item.label }))} value={mood} onChange={(value) => setMood(value as Mood)} />
              </StyleSection>
              <StyleSection label="Theme">
                <BtnGroup options={THEMES.map((item) => ({ key: item, label: item }))} value={theme} onChange={(value) => setTheme(value as Theme)} />
              </StyleSection>
              <StyleSection label="Accent Color">
                <div style={{ display: "flex", gap: "8px" }}>
                  {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
                    <div
                      key={color}
                      onClick={() => setAccentColor(color)}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: ACCENT_COLORS[color].primary,
                        cursor: "pointer",
                        border: accentColor === color ? "3px solid white" : "3px solid transparent",
                        outline: accentColor === color ? `2px solid ${ACCENT_COLORS[color].primary}` : "none",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>
              </StyleSection>
              <StyleSection label="Layout">
                <BtnGroup options={LAYOUTS.map((item) => ({ key: item, label: `Layout ${item}` }))} value={layout} onChange={(value) => setLayout(value as Layout)} />
              </StyleSection>
              <StyleSection label="Profile Shape">
                <BtnGroup options={PROFILE_SHAPES.map((item) => ({ key: item, label: item }))} value={profileShape} onChange={(value) => setProfileShape(value as ProfileShape)} />
              </StyleSection>
              <StyleSection label="Badge Style">
                <BtnGroup options={BADGE_STYLES.map((item) => ({ key: item, label: item }))} value={badgeStyle} onChange={(value) => setBadgeStyle(value as BadgeStyle)} />
              </StyleSection>
              <StyleSection label="Font Pair">
                <BtnGroup options={Object.entries(FONT_PAIRS).map(([key, value]) => ({ key, label: value.label }))} value={fontPair} onChange={(value) => setFontPair(value as FontPair)} />
              </StyleSection>
              <StyleSection label="Logo Placement">
                <BtnGroup options={LOGO_PLACEMENTS.map((item) => ({ key: item, label: item }))} value={logoPlacement} onChange={(value) => setLogoPlacement(value as LogoPlacement)} />
              </StyleSection>
              <StyleSection label="CTA Style">
                <BtnGroup options={CTA_STYLES.map((item) => ({ key: item.key, label: item.label }))} value={ctaStyle} onChange={(value) => setCtaStyle(value as CtaStyle)} />
              </StyleSection>

              <button onClick={handleGenerate} style={{ ...primaryButtonStyle, width: "100%", fontSize: "14px", padding: "13px" }}>
                Generate {selectedPlatforms.length} Platform Output{selectedPlatforms.length > 1 ? "s" : ""}
              </button>
            </div>

            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "8px" }}>
                Live Preview
              </div>
              <div style={{ background: "#101010", border: "1px solid #1c1c1c", borderRadius: "16px", padding: "14px" }}>
                {hasGraphicOutputs && activeGraphicMeta ? (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "10px", color: "#666", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: "8px" }}>
                        Post Preview
                      </div>
                      <BtnGroup
                        options={graphicPlatforms.map((slug) => {
                          const platform = PLATFORMS.find((item) => item.slug === slug)!;
                          return { key: slug, label: `${platform.icon} ${platform.label}` };
                        })}
                        value={activeGraphicMeta.slug}
                        onChange={(value) => setPlatformPreview(value as PlatformSlug)}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "#777", marginBottom: "10px", lineHeight: 1.5 }}>
                      Previewing {activeGraphicMeta.label} in {fmt.label} format ({fmt.width}x{fmt.height}).
                    </div>
                    <div style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 0 0 1px #1e1e1e, 0 16px 48px rgba(0,0,0,0.4)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      minHeight: `${previewFrameHeight}px`,
                      padding: "8px",
                      background: "#070707",
                    }}>
                      <div style={{ width: `${fmt.displayW}px`, height: `${fmt.displayH}px`, transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
                        <AchievementCard {...cardProps} />
                      </div>
                    </div>
                    {selectedPlatforms.length > graphicPlatforms.length && (
                      <div style={{ marginTop: "10px", fontSize: "11px", color: "#666", lineHeight: 1.5 }}>
                        Text-first platforms in this batch will still get their native title, body, or announcement outputs in the final step.
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    borderRadius: "14px",
                    border: "1px solid #1f1f1f",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, #0b0b0b 100%)",
                    padding: "18px",
                  }}>
                    <div style={{ fontSize: "11px", color: "#a3e635", fontWeight: 700, marginBottom: "10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Text-First Output
                    </div>
                    <div style={{ fontSize: "13px", color: "#d4d4d4", lineHeight: 1.6, marginBottom: "14px" }}>
                      The selected platforms are text-first, so the final output will be title, body, or announcement content instead of a graphic.
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {selectedPlatforms.map((slug) => {
                        const platform = PLATFORMS.find((item) => item.slug === slug)!;
                        const fields = getTextOutputTypes(platform.outputTypes).map((type) => OUTPUT_TYPE_LABELS[type]).join(" + ");
                        return (
                          <div key={slug} style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            background: "#111",
                            border: "1px solid #1c1c1c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}>
                            <div style={{ fontSize: "12px", color: "#f0f0f0" }}>{platform.icon} {platform.label}</div>
                            <div style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {fields}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "output" && (
          <div style={{ maxWidth: "1120px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f0f0f0", margin: "0 0 2px" }}>
                  Your content is ready
                </h2>
                <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
                  Generated for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/timeline")}
                  style={{
                    padding: "8px 16px",
                    background: "#111",
                    color: "#a3e635",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "1px solid #304217",
                    cursor: "pointer",
                  }}
                >
                  Open Saved Work
                </button>
                <button onClick={handleCreateNewEvent} style={{
                  padding: "8px 16px",
                  background: "#1a1a1a",
                  color: "#ccc",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "1px solid #2a2a2a",
                  cursor: "pointer",
                }}>
                  Create Another Post
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "4px", background: "#141414", borderRadius: "8px", padding: "4px", width: "fit-content", marginBottom: "20px" }}>
              {outputTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveOutputTab(tab)} style={{
                  padding: "7px 18px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: activeOutputTab === tab ? "#1e1e1e" : "transparent",
                  color: activeOutputTab === tab ? "#f0f0f0" : "#555",
                  fontWeight: activeOutputTab === tab ? 600 : 400,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}>
                  {tab === "graphic" ? "Graphic" : "Platform Copy"}
                </button>
              ))}
            </div>

            {activeOutputTab === "graphic" && hasGraphicOutputs && activeGraphicMeta && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#666", letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: "8px" }}>
                      Platform Preview
                    </div>
                    <BtnGroup
                      options={graphicPlatforms.map((slug) => {
                        const platform = PLATFORMS.find((item) => item.slug === slug)!;
                        return { key: slug, label: `${platform.icon} ${platform.label}` };
                      })}
                      value={activeGraphicMeta.slug}
                      onChange={(value) => setPlatformPreview(value as PlatformSlug)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DOWNLOAD_FORMATS.map((format) => (
                      <button key={format.key} onClick={() => setDownloadFormat(format.key)} style={{
                        padding: "5px 12px",
                        fontSize: "10px",
                        borderRadius: "6px",
                        background: downloadFormat === format.key ? "#a3e635" : "#161616",
                        color: downloadFormat === format.key ? "#000" : "#666",
                        border: `1px solid ${downloadFormat === format.key ? "#a3e635" : "#252525"}`,
                        fontWeight: downloadFormat === format.key ? 700 : 400,
                        cursor: "pointer",
                      }}>
                        {format.label} <span style={{ opacity: 0.5 }}>{format.width}x{format.height}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: "#777", lineHeight: 1.5 }}>
                    Optimized for {activeGraphicMeta.label} with native export size {fmt.width}x{fmt.height}.
                  </div>
                  <div style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 0 0 1px #1e1e1e, 0 16px 48px rgba(0,0,0,0.5)", width: "fit-content", maxWidth: "100%" }}>
                    <AchievementCard {...cardProps} />
                  </div>
                  <button onClick={handleDownload} disabled={isDownloading} style={{
                    padding: "11px",
                    background: "#1e1e1e",
                    color: "#f0f0f0",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "1px solid #2a2a2a",
                    cursor: "pointer",
                  }}>
                    {isDownloading ? "Exporting..." : `Download (${fmt.width}x${fmt.height})`}
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase", marginBottom: "10px" }}>
                    Quick Copy
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedPlatforms.slice(0, 4).map((slug) => {
                      const platform = PLATFORMS.find((item) => item.slug === slug)!;
                      return (
                        <div key={slug} style={{
                          background: "#111",
                          border: "1px solid #1a1a1a",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "3px" }}>{platform.icon} {platform.label}</div>
                            <div style={{ fontSize: "10px", color: "#555" }}>
                              {getCopySummary(slug, captions[slug])}
                            </div>
                          </div>
                          <button onClick={() => handleCopy(slug, serializePlatformContent(slug, captions[slug]))} style={{
                            fontSize: "10px",
                            padding: "4px 10px",
                            background: copied === slug ? "#1a2e0a" : "#1e1e1e",
                            color: copied === slug ? "#a3e635" : "#888",
                            border: `1px solid ${copied === slug ? "#a3e635" : "#2a2a2a"}`,
                            borderRadius: "5px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}>
                            {copied === slug ? "Copied" : "Copy"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeOutputTab === "captions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {selectedPlatforms.map((slug) => {
                    const platform = PLATFORMS.find((item) => item.slug === slug)!;
                    return (
                      <button key={slug} onClick={() => setActivePlatformTab(slug)} style={{
                        padding: "6px 14px",
                        fontSize: "12px",
                        borderRadius: "7px",
                        background: activePlatformTab === slug ? "#1e1e1e" : "#141414",
                        color: activePlatformTab === slug ? "#f0f0f0" : "#555",
                        border: `1px solid ${activePlatformTab === slug ? "#333" : "#1a1a1a"}`,
                        fontWeight: activePlatformTab === slug ? 600 : 400,
                        cursor: "pointer",
                      }}>
                        {platform.icon} {platform.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {activeTextOutputs.map((field) => {
                      const value = activePlatformContent[field] || "";
                      const limit = getFieldLimit(activePlatformMeta.slug, field);
                      const overLimit = !!limit && value.length > limit;
                      const fieldCopyKey = `${activePlatformMeta.slug}-${field}`;

                      return (
                        <div key={field} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                            <label style={{ fontSize: "11px", color: "#777", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {OUTPUT_TYPE_LABELS[field]}
                            </label>
                            <div style={{ fontSize: "10px", color: overLimit ? "#f87171" : "#555" }}>
                              {value.length}{limit ? ` / ${limit}` : ""}
                            </div>
                          </div>
                          <textarea
                            value={value}
                            onChange={(event) => setCaptions((current) => ({
                              ...current,
                              [activePlatformMeta.slug]: {
                                ...(current[activePlatformMeta.slug] || {}),
                                [field]: event.target.value,
                              },
                            }))}
                            style={{
                              background: "#161616",
                              border: `1px solid ${overLimit ? "#7f1d1d" : "#252525"}`,
                              borderRadius: "10px",
                              padding: "16px",
                              fontSize: "13px",
                              lineHeight: 1.75,
                              color: "#e0e0e0",
                              minHeight: field === "title" || field === "tagline" || field === "description" ? "110px" : "220px",
                              resize: "vertical",
                              fontFamily: "inherit",
                              outline: "none",
                            }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                            <div style={{ fontSize: "10px", color: overLimit ? "#fca5a5" : "#555" }}>
                              {limit ? `Recommended limit: ${limit} characters` : "No limit guidance set for this field"}
                            </div>
                            <button onClick={() => handleCopy(fieldCopyKey, value)} style={{
                              fontSize: "10px",
                              padding: "5px 10px",
                              background: copied === fieldCopyKey ? "#1a2e0a" : "#1e1e1e",
                              color: copied === fieldCopyKey ? "#a3e635" : "#888",
                              border: `1px solid ${copied === fieldCopyKey ? "#a3e635" : "#2a2a2a"}`,
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}>
                              {copied === fieldCopyKey ? "Copied" : `Copy ${OUTPUT_TYPE_LABELS[field]}`}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleCopy(activePlatformMeta.slug, serializePlatformContent(activePlatformMeta.slug, activePlatformContent))} style={{
                        flex: 1,
                        padding: "10px",
                        background: copied === activePlatformMeta.slug ? "#a3e635" : "#1e1e1e",
                        color: copied === activePlatformMeta.slug ? "#000" : "#f0f0f0",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        border: `1px solid ${copied === activePlatformMeta.slug ? "#a3e635" : "#2a2a2a"}`,
                        cursor: "pointer",
                      }}>
                        {copied === activePlatformMeta.slug ? "Copied!" : activeTextOutputs.length > 1 ? "Copy All Fields" : `Copy ${OUTPUT_TYPE_LABELS[activePrimaryOutput]}`}
                      </button>
                      {activePlatformMeta.slug === "linkedin" && (
                        <button
                          disabled={!activePrimaryContent.trim() || activePrimaryOverLimit}
                          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(activePrimaryContent)}`, "_blank")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "linear-gradient(135deg,#0077b5,#005e94)",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            borderRadius: "8px",
                            border: "none",
                            cursor: !activePrimaryContent.trim() || activePrimaryOverLimit ? "not-allowed" : "pointer",
                            opacity: !activePrimaryContent.trim() || activePrimaryOverLimit ? 0.45 : 1,
                          }}
                        >
                          Post on LinkedIn
                        </button>
                      )}
                      {activePlatformMeta.slug === "twitter" && (
                        <button
                          disabled={!activePrimaryContent.trim() || activePrimaryOverLimit}
                          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(activePrimaryContent)}`, "_blank")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#000",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            borderRadius: "8px",
                            border: "none",
                            cursor: !activePrimaryContent.trim() || activePrimaryOverLimit ? "not-allowed" : "pointer",
                            opacity: !activePrimaryContent.trim() || activePrimaryOverLimit ? 0.45 : 1,
                          }}
                        >
                          Post on X
                        </button>
                      )}
                    </div>

                    {activePrimaryOverLimit && (
                      <div style={{ fontSize: "11px", color: "#fca5a5", lineHeight: 1.5 }}>
                        Shorten the {OUTPUT_TYPE_LABELS[activePrimaryOutput].toLowerCase()} before using native share for {activePlatformMeta.label}.
                      </div>
                    )}
                  </div>

                  <div style={{
                    background: "#111",
                    border: "1px solid #1a1a1a",
                    borderRadius: "10px",
                    padding: "16px",
                    alignSelf: "start",
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#f0f0f0", marginBottom: "10px" }}>
                      {activePlatformMeta.icon} {activePlatformMeta.label} Rules
                    </div>
                    <div style={{ fontSize: "11px", color: "#666", marginBottom: "6px" }}>{activePlatformMeta.rules.tone}</div>
                    {activePlatformMeta.rules.limitNote && (
                      <div style={{ fontSize: "10px", color: "#777", marginBottom: "8px", lineHeight: 1.5 }}>
                        {activePlatformMeta.rules.limitNote}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" }}>
                      {activeTextOutputs.map((field) => {
                        const limit = getFieldLimit(activePlatformMeta.slug, field);
                        return (
                          <div key={field} style={{ fontSize: "10px", color: "#555" }}>
                            {OUTPUT_TYPE_LABELS[field]}: {limit ? `${limit} char target` : "No set target"}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                      {activePlatformMeta.rules.style.map((rule, index) => (
                        <div key={index} style={{ fontSize: "10px", color: "#888", display: "flex", gap: "5px" }}>
                          <span style={{ color: "#a3e635" }}>+</span> {rule}
                        </div>
                      ))}
                    </div>
                    {activePlatformMeta.rules.avoid.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px" }}>Avoid:</div>
                        {activePlatformMeta.rules.avoid.map((rule, index) => (
                          <div key={index} style={{ fontSize: "10px", color: "#555", display: "flex", gap: "5px" }}>
                            <span style={{ color: "#f87171" }}>x</span> {rule}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StyleSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 14px 12px" }}>
      <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "9px", letterSpacing: "0.02em" }}>{label}</label>
      {children}
    </div>
  );
}

function StepDoneDot() {
  return (
    <span style={{
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#000",
      display: "inline-block",
    }} />
  );
}

function EntryModeGlyph({ kind }: { kind: "manual" | "template" }) {
  if (kind === "manual") {
    return (
      <span style={{
        width: "36px",
        height: "36px",
        borderRadius: "12px",
        border: "1px solid #314415",
        background: "rgba(163,230,53,0.08)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <span style={{ width: "16px", height: "2px", borderRadius: "999px", background: "#a3e635", position: "absolute", top: "11px" }} />
        <span style={{ width: "20px", height: "2px", borderRadius: "999px", background: "#a3e635" }} />
        <span style={{ width: "12px", height: "2px", borderRadius: "999px", background: "#a3e635", position: "absolute", bottom: "11px" }} />
      </span>
    );
  }

  return (
    <span style={{
      width: "36px",
      height: "36px",
      borderRadius: "12px",
      border: "1px solid #252525",
      background: "#151515",
      display: "inline-grid",
      gridTemplateColumns: "repeat(2, 9px)",
      gridTemplateRows: "repeat(2, 9px)",
      gap: "4px",
      alignContent: "center",
      justifyContent: "center",
    }}>
      <span style={{ borderRadius: "3px", background: "#f0f0f0" }} />
      <span style={{ borderRadius: "3px", background: "#666" }} />
      <span style={{ borderRadius: "3px", background: "#666" }} />
      <span style={{ borderRadius: "3px", background: "#f0f0f0" }} />
    </span>
  );
}

function BtnGroup({ options, value, onChange }: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {options.map((option) => (
        <button key={option.key} onClick={() => onChange(option.key)} style={{
          padding: "6px 10px",
          fontSize: "11px",
          borderRadius: "8px",
          background: value === option.key ? "#a3e635" : "#1a1a1a",
          color: value === option.key ? "#000" : "#888",
          border: `1px solid ${value === option.key ? "#a3e635" : "#2a2a2a"}`,
          fontWeight: value === option.key ? 600 : 400,
          cursor: "pointer",
          textTransform: "capitalize",
          transition: "all 0.15s",
        }}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function pickFirst(values: Record<string, string>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function supportsGraphicPreview(slug: PlatformSlug) {
  return PLATFORMS.find((platform) => platform.slug === slug)?.outputTypes.includes("graphic") ?? false;
}

function getDefaultFormatForPlatform(slug: PlatformSlug): DownloadFormat {
  return PLATFORM_DEFAULT_FORMAT[slug] || "square";
}

function getTextOutputTypes(outputTypes: OutputType[]): TextOutputType[] {
  return outputTypes.filter((type): type is TextOutputType => type !== "graphic");
}

function getPrimaryTextOutputType(slug: PlatformSlug): TextOutputType {
  const platform = PLATFORMS.find((item) => item.slug === slug)!;
  return platform.rules.primaryTextOutput || getTextOutputTypes(platform.outputTypes)[0] || "caption";
}

function getFieldLimit(slug: PlatformSlug, field: TextOutputType): number | undefined {
  const platform = PLATFORMS.find((item) => item.slug === slug)!;
  return platform.rules.fieldLimits?.[field] ?? platform.rules.maxLength;
}

function serializePlatformContent(slug: PlatformSlug, content?: PlatformContent): string {
  if (!content) return "";

  const platform = PLATFORMS.find((item) => item.slug === slug)!;
  const fields = getTextOutputTypes(platform.outputTypes).filter((field) => (content[field] || "").trim());

  if (fields.length === 0) return "";
  if (fields.length === 1) return content[fields[0]] || "";

  return fields
    .map((field) => `${OUTPUT_TYPE_LABELS[field]}:\n${content[field] || ""}`)
    .join("\n\n");
}

function getCopySummary(slug: PlatformSlug, content?: PlatformContent): string {
  if (!content) return "Not generated yet";

  const platform = PLATFORMS.find((item) => item.slug === slug)!;
  const fields = getTextOutputTypes(platform.outputTypes).filter((field) => (content[field] || "").trim());
  if (fields.length === 0) return "Not generated yet";
  if (fields.length === 1) return OUTPUT_TYPE_LABELS[fields[0]];
  return fields.map((field) => OUTPUT_TYPE_LABELS[field]).join(" + ");
}

function getEventOptionsForCategory(category: EventCategorySlug): EventType[] {
  return [...getEventsByCategory(category), buildCustomEventType(category)];
}

function buildCustomEventType(category: EventCategorySlug): EventType {
  const categoryMeta = EVENT_CATEGORIES.find((item) => item.slug === category)!;
  return {
    id: `custom-${category}`,
    label: `Custom ${categoryMeta.label}`,
    icon: categoryMeta.icon,
    category,
    cardHeadline: "{{achievement}}",
    baseSummary: "{{name}} is sharing a custom update",
    fields: [
      { key: "name", label: "Your Name", placeholder: "Your Name", type: "text", maxLength: 50, required: true },
      { key: "achievement", label: "Headline / Main update", placeholder: "What are you announcing?", type: "text", maxLength: 80, required: true },
      { key: "role", label: "Your Role / Title", placeholder: "Founder, Engineer, Creator...", type: "text", maxLength: 50, required: true },
      { key: "company", label: "Company / Organization", placeholder: "Company, school, project, or community", type: "text", maxLength: 50, required: false },
      { key: "context", label: "Why this matters", placeholder: "Add the story, detail, or next step behind this update", type: "textarea", maxLength: 200, required: false },
      { key: "organizers", label: "Footer label / CTA", placeholder: "Website, event name, call to action, or partners", type: "text", maxLength: 60, required: false },
    ],
  };
}

const backButtonStyle: React.CSSProperties = {
  background: "transparent",
  color: "#666",
  fontSize: "12px",
  padding: "5px 10px",
  borderRadius: "6px",
  border: "1px solid #1e1e1e",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "11px 24px",
  background: "linear-gradient(135deg,#a3e635,#84cc16)",
  color: "#000",
  fontSize: "13px",
  fontWeight: 700,
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  background: "#161616",
  border: "1px solid #252525",
  borderRadius: "8px",
  color: "#f0f0f0",
  padding: "9px 12px",
  width: "100%",
  fontSize: "13px",
  outline: "none",
  resize: "vertical",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

