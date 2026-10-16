const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeText,
  sanitizeTheme,
  haveUniqueLinks,
  areLinksPublishable,
} = require('../utils/validators');

test('accepts valid email addresses', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('user.name+tag@example.co.uk'), true);
});

test('rejects invalid password values', () => {
  assert.equal(isValidPassword('short'), false);
  assert.equal(isValidPassword('password'), false);
  assert.equal(isValidPassword('Password1'), false);
  assert.equal(isValidPassword('Password1!'), true);
});

test('validates usernames and sanitizes text', () => {
  assert.equal(isValidUsername('linkuser_1'), true);
  assert.equal(isValidUsername('bad username'), false);
  assert.equal(sanitizeText('<script>alert(1)</script> Hello'), 'Hello');
});

test('normalizes supported profile theme values and rejects invalid values', () => {
  assert.deepEqual(sanitizeTheme({ accentColor: '#123456' }), {
    backgroundColor: '#17151c',
    accentColor: '#123456',
    themeName: 'after-hours',
    fontStyle: 'sans',
    layout: 'editorial',
    linkStyle: 'soft',
    cornerStyle: 'square',
  });
  assert.equal(sanitizeTheme({ accentColor: 'red' }), null);
  assert.equal(sanitizeTheme({ linkStyle: 'script' }), null);
  assert.equal(sanitizeTheme({ layout: 'unimplemented-layout' }), null);
  assert.equal(sanitizeTheme({ cornerStyle: 'round-everything' }), null);
});

test('maps legacy typography choices to the current sans default', () => {
  assert.equal(sanitizeTheme({ fontStyle: 'editorial' }).fontStyle, 'sans');
  assert.equal(sanitizeTheme({ fontStyle: 'mono' }).fontStyle, 'sans');
});

test('rejects repeated link titles and destinations on profile publish', () => {
  assert.equal(haveUniqueLinks([{ title: 'Portfolio', url: 'https://example.com' }, { title: 'News', url: 'https://news.example' }]), true);
  assert.equal(haveUniqueLinks([{ title: 'Portfolio', url: 'https://example.com' }, { title: 'portfolio', url: 'https://news.example' }]), false);
  assert.equal(haveUniqueLinks([{ title: 'Portfolio', url: 'https://example.com' }, { title: 'News', url: 'https://EXAMPLE.com' }]), false);
});

test('rejects invalid link sets rather than silently dropping links on publish', () => {
  assert.equal(areLinksPublishable([{ title: 'Portfolio', url: 'https://example.com' }]), true);
  assert.equal(areLinksPublishable([{ title: 'Portfolio', url: 'javascript:alert(1)' }]), false);
  assert.equal(areLinksPublishable([{ title: '   ', url: 'https://example.com' }]), false);
  assert.equal(areLinksPublishable(Array.from({ length: 11 }, (_, index) => ({ title: `Link ${index}`, url: `https://example${index}.com` }))), false);
});
