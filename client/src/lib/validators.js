export const isValidUsername = (username) => {
  if (!username) return false;
  return /^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase());
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim().toLowerCase());
export const isValidPassword = (password) => typeof password === "string" && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/.test(password);

export const getPasswordStrength = (password) => [
  password.length >= 8,
  /[a-z]/.test(password),
  /[A-Z]/.test(password),
  /\d/.test(password),
  /[@$!%*?&#^()_\-+=]/.test(password),
].filter(Boolean).length;

export const isValidHttpsUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
};

export const validateImage = (file) => {
  if (!file) return { valid: false, message: "Please select an image." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { valid: false, message: "Only JPEG, PNG or WebP images are supported." };
  }
  if (file.size > 5 * 1024 * 1024) return { valid: false, message: "Image size must be 5 MB or less." };
  return { valid: true };
};

export const hasDuplicateUrls = (links) => {
  const urls = links.map(({ url }) => url.trim().toLowerCase()).filter(Boolean);
  return urls.length !== new Set(urls).size;
};

export const hasDuplicateTitles = (links) => {
  const titles = links.map(({ title }) => title.trim().toLowerCase()).filter(Boolean);
  return titles.length !== new Set(titles).size;
};
