export const DEFAULT_PROFILE_THEME = Object.freeze({
  backgroundColor: "#17151c",
  accentColor: "#c0a2ff",
  themeName: "after-hours",
  fontStyle: "sans",
  layout: "editorial",
  linkStyle: "soft",
  cornerStyle: "square",
});

export const getProfileTheme = (theme = {}) => {
  const normalized = { ...DEFAULT_PROFILE_THEME, ...(theme || {}) };
  if (!["sans"].includes(normalized.fontStyle)) normalized.fontStyle = DEFAULT_PROFILE_THEME.fontStyle;
  return normalized;
};

export const readableTextForColor = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((part) => parseInt(part, 16) / 255) || [];
  if (channels.length !== 3) return "#17151c";
  const luminance = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? "#17151c" : "#ffffff";
};
