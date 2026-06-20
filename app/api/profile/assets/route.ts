import { NextResponse } from "next/server";
import { requireAuthenticatedUser, unauthorizedJson } from "@/lib/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PROFILE_ASSET_BUCKET = "profile-assets";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getSafeExtension(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "bin";
  if (extension === "jpg" || extension === "jpeg") return "jpg";
  if (extension === "png") return "png";
  if (extension === "webp") return "webp";
  return "bin";
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const kind = new URL(request.url).searchParams.get("kind");

    if (kind !== "photo" && kind !== "logo") {
      return NextResponse.json({ error: "Invalid asset kind." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and WebP images are allowed." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
    }

    const extension = getSafeExtension(file);
    const filePath = `${user.id}/${kind}-${Date.now()}.${extension}`;
    const supabase = await createSupabaseServerClient();
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage.from(PROFILE_ASSET_BUCKET).upload(filePath, bytes, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(PROFILE_ASSET_BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedJson();
    }

    return NextResponse.json({ error: "Failed to upload profile asset." }, { status: 500 });
  }
}
