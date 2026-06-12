// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE — stored in localStorage (MVP), Supabase (production)
// PRD §11 — create once, auto-populates all future events
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  headline: string;        // "Software Engineer at Google"
  role: string;            // "Software Engineer"
  company: string;
  bio: string;
  website: string;
  photoUrl: string | null;
  logoUrl: string | null;
  brandColor: string;      // hex
  brandTheme: "dark" | "light" | "premium" | "startup" | "corporate" | "modern";
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
  };
  setupComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "g2o_profile";
export const PROFILE_UPDATED_EVENT = "g2o_profile_updated";

function createEmptyProfile(): UserProfile {
  return {
    name: "",
    headline: "",
    role: "",
    company: "",
    bio: "",
    website: "",
    photoUrl: null,
    logoUrl: null,
    brandColor: "#a3e635",
    brandTheme: "dark",
    social: {},
    setupComplete: false,
    createdAt: "",
    updatedAt: "",
  };
}

export const EMPTY_PROFILE: UserProfile = createEmptyProfile();

export function getEmptyProfile(): UserProfile {
  return createEmptyProfile();
}

export function loadProfile(): UserProfile {
  const fallback = getEmptyProfile();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const now = new Date().toISOString();
    const nextProfile: UserProfile = {
      ...getEmptyProfile(),
      ...profile,
      createdAt: profile.createdAt || now,
      updatedAt: now,
      setupComplete: isProfileComplete(profile),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  } catch {}
}

export function isProfileComplete(p: UserProfile): boolean {
  return !!(p.name && p.role && p.photoUrl);
}

export function profileCompletionSteps(p: UserProfile): { label: string; done: boolean }[] {
  return [
    { label: "Add your name",          done: !!p.name },
    { label: "Upload profile photo",   done: !!p.photoUrl },
    { label: "Add your role",          done: !!p.role },
    { label: "Add your company",       done: !!p.company },
    { label: "Write a short bio",      done: !!p.bio },
    { label: "Add a social link",      done: Object.values(p.social).some(Boolean) },
  ];
}
