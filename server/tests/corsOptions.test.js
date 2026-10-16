const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cors = require("cors");
const { createServer } = require("node:http");
const { createCorsOptions, isAllowedOrigin } = require("../utils/corsOptions");

test("allows stable, configured, local, and project-owned Vercel origins", () => {
  const options = createCorsOptions("https://linkhub.example.com/path");
  const allowed = [
    "https://linkinbio-mern.vercel.app",
    "https://linkhub.example.com",
    "http://localhost:5173",
    "https://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app",
    "https://linkinbio-mern-preview-branch-42-kavinayas-projects.vercel.app",
  ];

  for (const origin of allowed) {
    assert.equal(isAllowedOrigin(origin, [
      "http://localhost:5173",
      "https://linkinbio-mern.vercel.app",
      "https://linkhub.example.com",
    ]), true, origin);
  }
  assert.equal(typeof options.origin, "function");
});

test("rejects unrelated domains and lookalike Vercel origins", () => {
  const allowed = ["http://localhost:5173", "https://linkinbio-mern.vercel.app"];
  const rejected = [
    "https://unrelated.vercel.app",
    "https://linkinbio-mern-fimfdgw5h-attacker.vercel.app",
    "https://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app.attacker.test",
    "http://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app",
    "https://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app:444",
  ];

  for (const origin of rejected) assert.equal(isAllowedOrigin(origin, allowed), false, origin);
});

test("answers OPTIONS preflight for an allowed project preview origin", async (t) => {
  const app = express();
  app.use(cors(createCorsOptions("https://linkinbio-mern.vercel.app")));
  app.post("/api/auth/login", (_req, res) => res.sendStatus(200));
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://linkinbio-mern-fimfdgw5h-kavinayas-projects.vercel.app");
  assert.match(response.headers.get("access-control-allow-methods"), /POST/);
});
