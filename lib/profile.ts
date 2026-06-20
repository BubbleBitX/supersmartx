export interface UserProfile {
  name: string;
  headline: string;
  role: string;
  company: string;
  bio: string;
  website: string;
  photoUrl: string | null;
  logoUrl: string | null;
  brandColor: string;
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

export const PROFILE_UPDATED_EVENT = "ssx_profile_updated";

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

export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch("/api/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return getEmptyProfile();
  }

  if (!response.ok) {
    throw new Error("Failed to load profile.");
  }

  const payload = (await response.json()) as { profile: UserProfile };
  return { ...getEmptyProfile(), ...payload.profile };
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const response = await fetch("/api/profile", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to save profile.");
  }

  const payload = (await response.json()) as { profile: UserProfile };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  }

  return { ...getEmptyProfile(), ...payload.profile };
}

export async function uploadProfileAsset(file: File, kind: "photo" | "logo"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/profile/assets?kind=${kind}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${kind}.`);
  }

  const payload = (await response.json()) as { publicUrl: string };
  return payload.publicUrl;
}

export function isProfileComplete(p: UserProfile): boolean {
  return !!(p.name && p.role && p.photoUrl);
}

export function profileCompletionSteps(p: UserProfile): { label: string; done: boolean }[] {
  return [
    { label: "Add your name", done: !!p.name },
    { label: "Upload profile photo", done: !!p.photoUrl },
    { label: "Add your role", done: !!p.role },
    { label: "Add your company", done: !!p.company },
    { label: "Write a short bio", done: !!p.bio },
    { label: "Add a social link", done: Object.values(p.social).some(Boolean) },
  ];
}
