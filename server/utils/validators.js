const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const HTTPS_URL_PATTERN = /^https:\/\/[^^\s]+$/i;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeUsername = (value) => normalizeText(value).toLowerCase();

const isValidEmail = (value) => {
  const email = normalizeEmail(value);
  return email.length > 0 && EMAIL_PATTERN.test(email);
};

const isValidPassword = (value) => {
  if (typeof value !== 'string') return false;
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
};

const isValidUsername = (value) => {
  const username = normalizeUsername(value);
  return username.length > 0 && USERNAME_PATTERN.test(username);
};

const isValidUrl = (value) => {
  if (typeof value !== 'string') return false;
  return HTTPS_URL_PATTERN.test(value.trim());
};

const sanitizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim();
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  isValidUrl,
  normalizeEmail,
  normalizeUsername,
  sanitizeText,
};
