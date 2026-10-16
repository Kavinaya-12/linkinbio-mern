const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("node:crypto");

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
});

let client;

const getSupabaseConfigError = (environment = process.env) => {
  const missing = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_BUCKET"]
    .filter((key) => !environment[key]?.trim());
  return missing.length
    ? `Avatar storage is not configured. Set ${missing.join(", ")} in server/.env, then restart the server.`
    : null;
};

const getSupabaseClient = () => {
  const configError = getSupabaseConfigError();
  if (configError) throw new Error("Supabase storage is not configured.");
  if (!client) {
    client = createClient(process.env.SUPABASE_URL.trim(), process.env.SUPABASE_SECRET_KEY.trim(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
};

const parseAvatarDataUrl = (value) => {
  if (typeof value !== "string") return { error: "Choose a JPEG, PNG or WebP image." };
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return { error: "Only JPEG, PNG or WebP images are supported." };

  const [, contentType, encoded] = match;
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length || buffer.toString("base64") !== encoded) {
    return { error: "The selected image is invalid." };
  }
  if (buffer.length > MAX_AVATAR_BYTES) {
    return { error: "Image size must be 5 MB or less." };
  }

  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  const signatureMatches = contentType === "image/jpeg" ? isJpeg : contentType === "image/png" ? isPng : isWebp;
  if (!signatureMatches) return { error: "The image contents do not match its file type." };

  return { buffer, contentType, extension: MIME_EXTENSIONS[contentType] };
};

const uploadAvatar = async ({ ownerId, buffer, contentType, extension }) => {
  try {
    const storage = getSupabaseClient().storage.from(process.env.SUPABASE_BUCKET.trim());
    const objectPath = `${ownerId}/${randomUUID()}.${extension}`;
    const { error } = await storage.upload(objectPath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });
    if (error) throw error;
    const { data } = storage.getPublicUrl(objectPath);
    if (!data?.publicUrl) {
      await storage.remove([objectPath]);
      throw new Error("Public URL was not returned.");
    }
    return { objectPath, publicUrl: data.publicUrl };
  } catch {
    const uploadError = new Error("Avatar storage upload failed.");
    uploadError.avatarStorageError = true;
    throw uploadError;
  }
};

const getOwnedObjectPath = (avatarUrl, ownerId, environment = process.env) => {
  if (!avatarUrl || !environment.SUPABASE_URL || !environment.SUPABASE_BUCKET) return null;
  try {
    const publicBase = new URL(`/storage/v1/object/public/${encodeURIComponent(environment.SUPABASE_BUCKET.trim())}/`, environment.SUPABASE_URL);
    const candidate = new URL(avatarUrl);
    if (candidate.origin !== publicBase.origin || !candidate.pathname.startsWith(publicBase.pathname)) return null;
    const objectPath = decodeURIComponent(candidate.pathname.slice(publicBase.pathname.length));
    return objectPath.startsWith(`${ownerId}/`) && !objectPath.includes("..") ? objectPath : null;
  } catch {
    return null;
  }
};

const removeAvatar = async (objectPath) => {
  if (!objectPath) return;
  const { error } = await getSupabaseClient().storage.from(process.env.SUPABASE_BUCKET.trim()).remove([objectPath]);
  if (error) throw new Error("Avatar cleanup failed.");
};

module.exports = {
  MAX_AVATAR_BYTES,
  getSupabaseConfigError,
  parseAvatarDataUrl,
  uploadAvatar,
  getOwnedObjectPath,
  removeAvatar,
};
