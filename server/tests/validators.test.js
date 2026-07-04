const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeText,
} = require('../utils/validators');

test('accepts valid email addresses', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('user.name+tag@example.co.uk'), true);
});

test('rejects invalid password values', () => {
  assert.equal(isValidPassword('short'), false);
  assert.equal(isValidPassword('password'), false);
  assert.equal(isValidPassword('Password1'), true);
});

test('validates usernames and sanitizes text', () => {
  assert.equal(isValidUsername('linkuser_1'), true);
  assert.equal(isValidUsername('bad username'), false);
  assert.equal(sanitizeText('<script>alert(1)</script> Hello'), 'Hello');
});
