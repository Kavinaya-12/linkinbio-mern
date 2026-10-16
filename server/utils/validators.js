const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const THEME_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DEFAULT_THEME = Object.freeze({
  backgroundColor: "#17151c",
  accentColor: "#c0a2ff",
  themeName: "after-hours",
  fontStyle: "sans",
  layout: "editorial",
  linkStyle: "soft",
  cornerStyle: "square",
});

const normalizeText = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const normalizeEmail = (value) => {
  return normalizeText(value).toLowerCase();
};

const normalizeUsername = (value) => {
  return normalizeText(value).toLowerCase();
};

const isValidEmail = (email) => {
  const normalized = normalizeEmail(email);
  return EMAIL_PATTERN.test(normalized);
};

const isValidPassword = (password) => {
  if (typeof password !== "string") return false;

  // Minimum 8 chars
  // At least one uppercase
  // At least one lowercase
  // At least one number
  // At least one special character

  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/.test(
    password
  );
};

const isValidUsername = (username) => {
  const normalized = normalizeUsername(username);
  return USERNAME_PATTERN.test(normalized);
};

const isValidUrl = (url) => {
  if (typeof url !== "string") return false;

  try {
    const parsed = new URL(url.trim());

    return (
      parsed.protocol === "https:" &&
      parsed.hostname.length > 0
    );
  } catch {
    return false;
  }
};

const sanitizeText = (text) => {
  if (typeof text !== "string") return "";

  return text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
};

const sanitizeBio = (bio) => {
  const cleaned = sanitizeText(bio);

  return cleaned.substring(0, 160);
};

const sanitizeLinks = (links) => {
  if (!Array.isArray(links)) return [];

  return links
    .filter((link) => {
      return (
        link &&
        typeof link.title === "string" &&
        typeof link.url === "string" &&
        link.title.trim() &&
        isValidUrl(link.url)
      );
    })
    .map((link) => ({
      title: sanitizeText(link.title),
      url: link.url.trim(),
    }))
    .slice(0, 10); // Maximum 10 links
};

const haveUniqueLinks = (links) => {
  if (!Array.isArray(links)) return false;
  const titles = links.map(({ title }) => title.trim().toLowerCase());
  const urls = links.map(({ url }) => url.trim().toLowerCase());
  return new Set(titles).size === titles.length && new Set(urls).size === urls.length;
};

const areLinksPublishable = (links) => Array.isArray(links)
  && links.length <= 10
  && links.every((link) => link
    && typeof link.title === "string"
    && link.title.trim().length > 0
    && link.title.trim().length <= 40
    && isValidUrl(link.url));

const sanitizeTheme = (theme) => {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) return null;
  const normalized = {
    backgroundColor: theme.backgroundColor ?? DEFAULT_THEME.backgroundColor,
    accentColor: theme.accentColor ?? DEFAULT_THEME.accentColor,
    themeName: theme.themeName ?? DEFAULT_THEME.themeName,
    fontStyle: "sans",
    layout: theme.layout ?? DEFAULT_THEME.layout,
    linkStyle: theme.linkStyle ?? DEFAULT_THEME.linkStyle,
    cornerStyle: theme.cornerStyle ?? DEFAULT_THEME.cornerStyle,
  };
  if (
    !THEME_COLOR_PATTERN.test(normalized.backgroundColor) ||
    !THEME_COLOR_PATTERN.test(normalized.accentColor) ||
    !["after-hours", "paper", "moss"].includes(normalized.themeName) ||
    !["editorial", "stacked"].includes(normalized.layout) ||
    !["solid", "outline", "soft"].includes(normalized.linkStyle) ||
    !["square", "soft"].includes(normalized.cornerStyle)
  ) return null;
  return normalized;
};

module.exports = {
  normalizeText,
  normalizeEmail,
  normalizeUsername,

  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidUrl,

  sanitizeText,
  sanitizeBio,
  sanitizeLinks,
  haveUniqueLinks,
  areLinksPublishable,
  sanitizeTheme,
  DEFAULT_THEME,
};
