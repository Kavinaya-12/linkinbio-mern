const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authController = require('../controllers/authController');

const invoke = async (body) => {
  const req = { body };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
  let forwardedError;
  await authController.login(req, res, (error) => { forwardedError = error; });
  return { res, forwardedError };
};

test('login explicitly selects the hidden password hash and normalizes email', async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-jwt-secret';
  let selectedFields;
  let query;
  User.findOne = (filter) => {
    query = filter;
    return { select(fields) { selectedFields = fields; return Promise.resolve({ _id: 'user-id', email: 'creator@example.com', username: 'creator', password: 'stored-hash' }); } };
  };
  bcrypt.compare = async (password, hash) => password === 'Correct1!' && hash === 'stored-hash';

  try {
    const { res, forwardedError } = await invoke({ email: ' Creator@Example.com ', password: 'Correct1!' });
    assert.equal(forwardedError, undefined);
    assert.equal(query.email, 'creator@example.com');
    assert.equal(selectedFields, '+password');
    assert.equal(res.statusCode, 200);
    assert.ok(res.payload.token);
    assert.deepEqual(res.payload.user, { id: 'user-id', username: 'creator', email: 'creator@example.com' });
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test('login keeps invalid credentials generic', async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({ select: async () => ({ _id: 'user-id', password: 'stored-hash' }) });
  try {
    const { res, forwardedError } = await invoke({ email: 'creator@example.com', password: 'wrong' });
    assert.equal(forwardedError, undefined);
    assert.equal(res.statusCode, 401);
    assert.equal(res.payload.message, 'Invalid email or password.');
  } finally {
    User.findOne = originalFindOne;
  }
});
