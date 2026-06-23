import type {
  AccentColor,
  BackgroundPreset,
  BadgeStyle,
  CtaStyle,
  DownloadFormat,
  FontPair,
  Layout,
  LogoPlacement,
  ProfileShape,
  Theme,
} from "@/lib/templates";
import type { PlatformSlug, Mood, Voice } from "@/lib/platforms";
import type { TimelineEvent } from "@/lib/timeline";

export type GuestCreateStep = "entry" | "category" | "event" | "platforms" | "form" | "style" | "output";

export interface GuestCreateDraft {
  selectedCategory: string | null;
  selectedEventId: string | null;
  selectedPlatforms: PlatformSlug[];
  formValues: Record<string, string>;
  step: GuestCreateStep;
  theme: Theme;
  accentColor: AccentColor;
  profileShape: ProfileShape;
  layout: Layout;
  badgeStyle: BadgeStyle;
  fontPair: FontPair;
  logoPlacement: LogoPlacement;
  ctaStyle: CtaStyle;
  backgroundPreset: BackgroundPreset;
  downloadFormat: DownloadFormat;
  voice: Voice;
  mood: Mood;
  captions: Record<string, Record<string, string>>;
  activePlatformTab: PlatformSlug | null;
  activeGraphicPlatform: PlatformSlug | null;
  activeOutputTab: "graphic" | "captions";
  backgroundImageUrl: string | null;
  backgroundImageName: string | null;
  generatedGuestEvent: TimelineEvent | null;
  guestGenerationUsed: boolean;
  migratedToAccount: boolean;
  reuseSourceId: string | null;
  reuseSourceCreatedAt: string | null;
}

const STORAGE_KEY = "ssx_session";
const LEGACY_STORAGE_KEY = "ssx_guest_create_draft_v1";

export function getEmptyGuestDraft(): GuestCreateDraft {
  return {
    selectedCategory: null,
    selectedEventId: null,
    selectedPlatforms: [],
    formValues: {},
    step: "entry",
    theme: "dark",
    accentColor: "lime",
    profileShape: "rounded",
    layout: "A",
    badgeStyle: "professional",
    fontPair: "classic",
    logoPlacement: "bottom",
    ctaStyle: "follow",
    backgroundPreset: "aurora",
    downloadFormat: "square",
    voice: "professional",
    mood: "achievement",
    captions: {},
    activePlatformTab: null,
    activeGraphicPlatform: null,
    activeOutputTab: "graphic",
    backgroundImageUrl: null,
    backgroundImageName: null,
    generatedGuestEvent: null,
    guestGenerationUsed: false,
    migratedToAccount: false,
    reuseSourceId: null,
    reuseSourceCreatedAt: null,
  };
}

export function readGuestDraft(): GuestCreateDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<GuestCreateDraft>;
    return {
      ...getEmptyGuestDraft(),
      ...parsed,
      formValues: parsed.formValues ?? {},
      captions: parsed.captions ?? {},
      selectedPlatforms: parsed.selectedPlatforms ?? [],
    };
  } catch {
    return null;
  }
}

export function writeGuestDraft(draft: GuestCreateDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearGuestDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

