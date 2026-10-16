const SAFE_IDENTIFIER = /^[A-Za-z0-9_.-]{1,64}$/;

const classifyMongoFailure = (error = {}) => {
  const text = `${error.name || ""} ${error.code || ""} ${error.message || ""}`;
  if (Number(error.code) === 18 || /AuthenticationFailed|authenticat|SASL|\bcode\s*18\b/i.test(text)) return "authentication";
  if (/TLS|SSL|certificate|ERR_TLS/i.test(text)) return "tls";
  if (/querySrv|ENOTFOUND|EAI_AGAIN/i.test(text)) return "dns";
  if (/ETIMEDOUT|timeout|MongoNetworkTimeout/i.test(text)) return "timeout";
  if (/ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ENETUNREACH/i.test(text)) return "network";
  if (/not authorized|Unauthorized/i.test(text)) return "authorization";
  return "other";
};

const safeIdentifier = (value) => SAFE_IDENTIFIER.test(String(value || "")) ? value : undefined;

const sanitizeMessage = (value) => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[MongoDB URI redacted]")
    .replace(/(password|passwd|pwd|username|user|token|secret|signature)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 240);
};

const describeError = (error) => {
  if (!error) return undefined;
  return {
    name: safeIdentifier(error.name) || "Error",
    code: safeIdentifier(error.code),
    category: classifyMongoFailure(error),
    message: sanitizeMessage(error.message),
  };
};

const getMongoErrorDiagnostics = (error = {}) => {
  const servers = [];
  const serverMap = error.reason?.servers;

  if (serverMap && typeof serverMap[Symbol.iterator] === "function") {
    for (const [, server] of serverMap) {
      servers.push({
        type: safeIdentifier(server?.type) || "unknown",
        error: describeError(server?.error),
      });
    }
  }

  const nestedCategories = [...new Set(servers.map((server) => server.error?.category).filter(Boolean))];
  const category = classifyMongoFailure(error);

  return {
    name: safeIdentifier(error.name) || "Error",
    code: safeIdentifier(error.code),
    category: category === "other" && nestedCategories.length === 1 ? nestedCategories[0] : category,
    nestedCategories,
    message: sanitizeMessage(error.message),
    topologyType: safeIdentifier(error.reason?.type),
    serverCount: servers.length,
    servers,
    cause: describeError(error.cause),
    topologyError: describeError(error.reason?.error),
  };
};

module.exports = { classifyMongoFailure, getMongoErrorDiagnostics };
