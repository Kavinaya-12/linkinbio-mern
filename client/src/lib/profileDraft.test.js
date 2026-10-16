import test from "node:test";
import assert from "node:assert/strict";
import { clearProfileDraft, getProfileDraftKey, readProfileDraft, writeProfileDraft } from "./profileDraft.js";

const withStorage = async (run) => {
  const previous = globalThis.localStorage;
  const entries = new Map();
  globalThis.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: (key) => entries.delete(key),
  };
  try { await run(entries); } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
};

test("profile drafts are versioned, contain no session credentials, and stay isolated by account", async () => withStorage((entries) => {
  const accountA = getProfileDraftKey("account-a");
  const accountB = getProfileDraftKey("account-b");
  assert.notEqual(accountA, accountB);
  const profile = { username: "creator_a", bio: "Draft text", avatarUrl: "", links: [], theme: { backgroundColor: "#f5f5f1", accentColor: "#6b745f", linkStyle: "soft" } };
  assert.equal(writeProfileDraft(accountA, "account-a", profile, "server-version-1"), true);
  assert.deepEqual(Object.keys(JSON.parse(entries.get(accountA))).sort(), ["accountId", "baseUpdatedAt", "profile", "savedAt", "version"]);
  assert.doesNotMatch(entries.get(accountA), /password|token/i);
  assert.deepEqual(readProfileDraft(accountA, "account-a").profile, profile);
  assert.equal(readProfileDraft(accountA, "account-b"), null);
  clearProfileDraft(accountA, "account-b");
  assert.ok(readProfileDraft(accountA, "account-a"));
  clearProfileDraft(accountA, "account-a");
  assert.equal(readProfileDraft(accountA, "account-a"), null);
}));
