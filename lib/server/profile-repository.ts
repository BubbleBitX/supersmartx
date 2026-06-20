import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEmptyProfile, isProfileComplete, type UserProfile } from "@/lib/profile";

type ProfileInput = UserProfile;

function mapProfileRecord(record: Profile | null): UserProfile {
  if (!record) {
    return getEmptyProfile();
  }

  return {
    name: record.name,
    headline: record.headline,
    role: record.role,
    company: record.company,
    bio: record.bio,
    website: record.website,
    photoUrl: record.photoUrl,
    logoUrl: record.logoUrl,
    brandColor: record.brandColor,
    brandTheme: record.brandTheme as UserProfile["brandTheme"],
    social: typeof record.social === "object" && record.social ? (record.social as UserProfile["social"]) : {},
    setupComplete: record.setupComplete,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getProfileByUserId(userId: string) {
  const record = await prisma.profile.findUnique({
    where: { userId },
  });

  return mapProfileRecord(record);
}

export async function upsertProfileForUser(userId: string, profile: ProfileInput) {
  const record = await prisma.profile.upsert({
    where: { userId },
    update: {
      name: profile.name,
      headline: profile.headline,
      role: profile.role,
      company: profile.company,
      bio: profile.bio,
      website: profile.website,
      photoUrl: profile.photoUrl,
      logoUrl: profile.logoUrl,
      brandColor: profile.brandColor,
      brandTheme: profile.brandTheme,
      social: profile.social,
      setupComplete: isProfileComplete(profile),
    },
    create: {
      userId,
      name: profile.name,
      headline: profile.headline,
      role: profile.role,
      company: profile.company,
      bio: profile.bio,
      website: profile.website,
      photoUrl: profile.photoUrl,
      logoUrl: profile.logoUrl,
      brandColor: profile.brandColor,
      brandTheme: profile.brandTheme,
      social: profile.social,
      setupComplete: isProfileComplete(profile),
    },
  });

  return mapProfileRecord(record);
}
