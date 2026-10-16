const STABLE_VERCEL_ORIGIN = "https://linkinbio-mern.vercel.app";
const PROJECT_PREVIEW_ORIGIN = /^https:\/\/linkinbio-mern-(?:[a-z0-9]+-)*[a-z0-9]+-kavinayas-projects\.vercel\.app$/;

const getConfiguredClientOrigin = (clientUrl = process.env.CLIENT_URL) => {
  if (!clientUrl) return null;
  try {
    return new URL(clientUrl).origin;
  } catch {
    return null;
  }
};

const getAllowedOrigins = (clientUrl) => [
  "http://localhost:5173",
  STABLE_VERCEL_ORIGIN,
  getConfiguredClientOrigin(clientUrl),
].filter(Boolean);

const isAllowedOrigin = (origin, allowedOrigins = getAllowedOrigins()) => (
  !origin || allowedOrigins.includes(origin) || PROJECT_PREVIEW_ORIGIN.test(origin)
);

const createCorsOptions = (clientUrl) => {
  const allowedOrigins = getAllowedOrigins(clientUrl);
  return {
    origin(origin, callback) {
      if (isAllowedOrigin(origin, allowedOrigins)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

module.exports = { createCorsOptions, getAllowedOrigins, isAllowedOrigin };
