const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const invoke = (token) => {
  const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  authMiddleware(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

test('JWT verification accepts valid tokens and rejects expired tokens', () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-jwt-secret';
  try {
    const valid = jwt.sign({ id: 'user-test-id' }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const validResult = invoke(valid);
    assert.equal(validResult.nextCalled, true);
    assert.equal(validResult.req.userId, 'user-test-id');

    const expired = jwt.sign({ id: 'user-test-id' }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expiredResult = invoke(expired);
    assert.equal(expiredResult.res.statusCode, 401);
    assert.match(expiredResult.res.body.message, /expired/i);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
