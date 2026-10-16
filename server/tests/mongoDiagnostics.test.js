const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyMongoFailure, getMongoErrorDiagnostics } = require("../utils/mongoDiagnostics");

test("classifies common MongoDB connection failure categories", () => {
  assert.equal(classifyMongoFailure({ code: "ENOTFOUND" }), "dns");
  assert.equal(classifyMongoFailure({ name: "MongoNetworkTimeoutError" }), "timeout");
  assert.equal(classifyMongoFailure({ name: "MongoServerError", code: 18 }), "authentication");
  assert.equal(classifyMongoFailure({ message: "TLS certificate validation failed" }), "tls");
});

test("reports nested server failures without exposing addresses or credentials", () => {
  const diagnostics = getMongoErrorDiagnostics({
    name: "MongooseServerSelectionError",
    message: "connect failed mongodb+srv://private-user:private-pass@example.mongodb.net/app",
    reason: {
      type: "ReplicaSetNoPrimary",
      servers: new Map([[
        "cluster-shard-00-00.example.mongodb.net:27017",
        { type: "Unknown", error: Object.assign(new Error("querySrv ETIMEDOUT"), { code: "ETIMEDOUT" }) },
      ]]),
    },
  });

  assert.equal(diagnostics.category, "dns");
  assert.equal(diagnostics.servers[0].error.category, "dns");
  assert.doesNotMatch(JSON.stringify(diagnostics), /private-user|private-pass|example\.mongodb\.net/);
});
