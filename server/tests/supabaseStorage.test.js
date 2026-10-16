const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getSupabaseConfigError,
  parseAvatarDataUrl,
  getOwnedObjectPath,
} = require("../utils/supabaseStorage");

const jpegDataUrl = (bytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9])) =>
  `data:image/jpeg;base64,${bytes.toString("base64")}`;

test("reports missing Supabase settings without exposing supplied credentials", () => {
  const message = getSupabaseConfigError({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "private-secret-sentinel",
    SUPABASE_BUCKET: "",
  });
  assert.match(message, /SUPABASE_BUCKET/);
  assert.doesNotMatch(message, /private-secret-sentinel/);
  assert.equal(getSupabaseConfigError({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "server-secret",
    SUPABASE_BUCKET: "avatars",
  }), null);
});

test("accepts supported image signatures and rejects unsupported or mismatched types", () => {
  assert.equal(parseAvatarDataUrl(jpegDataUrl()).contentType, "image/jpeg");
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  assert.equal(parseAvatarDataUrl(`data:image/png;base64,${png.toString("base64")}`).contentType, "image/png");
  const webp = Buffer.from("RIFF0000WEBP", "ascii");
  assert.equal(parseAvatarDataUrl(`data:image/webp;base64,${webp.toString("base64")}`).contentType, "image/webp");
  assert.match(parseAvatarDataUrl(`data:image/gif;base64,${Buffer.from("GIF89a").toString("base64")}`).error, /JPEG, PNG or WebP/);
  assert.match(parseAvatarDataUrl(`data:image/png;base64,${Buffer.from("not png").toString("base64")}`).error, /contents do not match/);
  assert.match(parseAvatarDataUrl("data:image/jpeg;base64,%%%=").error, /supported|invalid/i);
});

test("enforces the 5 MB decoded size limit", () => {
  const bytes = Buffer.alloc(5 * 1024 * 1024 + 1);
  bytes.set([0xff, 0xd8, 0xff]);
  assert.match(parseAvatarDataUrl(jpegDataUrl(bytes)).error, /5 MB/);
});

test("only identifies Supabase object paths owned by the requested user", () => {
  const environment = { SUPABASE_URL: "https://example.supabase.co", SUPABASE_BUCKET: "avatars" };
  assert.equal(
    getOwnedObjectPath("https://example.supabase.co/storage/v1/object/public/avatars/user-1/photo.jpg", "user-1", environment),
    "user-1/photo.jpg"
  );
  assert.equal(
    getOwnedObjectPath("https://example.supabase.co/storage/v1/object/public/avatars/user-2/photo.jpg", "user-1", environment),
    null
  );
  assert.equal(getOwnedObjectPath("https://images.example.com/account/avatar.png", "user-1", environment), null);
});
