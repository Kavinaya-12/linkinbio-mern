export const PROFILE_DRAFT_VERSION = 1;
const DRAFT_PREFIX = "linkhub.profile-draft.v1";

export const getAccountId = (user, token) => {
  const id = user?.id || user?._id;
  if (id) return String(id);
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(payload));
    return decoded.id ? String(decoded.id) : null;
  } catch {
    return null;
  }
};

export const getProfileDraftKey = (accountId) => accountId
  ? `${DRAFT_PREFIX}.${encodeURIComponent(accountId)}`
  : null;

export const readProfileDraft = (key, accountId) => {
  if (!key || !accountId) return null;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || "null");
    if (draft?.version !== PROFILE_DRAFT_VERSION || draft.accountId !== accountId || !draft.profile) return null;
    const { username, bio, avatarUrl, links, theme } = draft.profile;
    if (
      typeof username !== "string" || typeof bio !== "string" || typeof avatarUrl !== "string"
      || !Array.isArray(links) || !links.every((link) => link && typeof link.title === "string" && typeof link.url === "string")
      || !theme || typeof theme.backgroundColor !== "string" || typeof theme.accentColor !== "string"
      || !["solid", "outline", "soft"].includes(theme.linkStyle)
    ) return null;
    return draft;
  } catch {
    return null;
  }
};

export const writeProfileDraft = (key, accountId, profile, baseUpdatedAt) => {
  if (!key || !accountId) return false;
  try {
    localStorage.setItem(key, JSON.stringify({
      version: PROFILE_DRAFT_VERSION,
      accountId,
      savedAt: new Date().toISOString(),
      baseUpdatedAt: baseUpdatedAt || null,
      profile,
    }));
    return true;
  } catch {
    return false;
  }
};

export const clearProfileDraft = (key, accountId) => {
  if (!key || !accountId) return;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || "null");
    if (draft?.accountId === accountId) localStorage.removeItem(key);
  } catch {
    try { localStorage.removeItem(key); } catch { /* storage may be unavailable */ }
  }
};
