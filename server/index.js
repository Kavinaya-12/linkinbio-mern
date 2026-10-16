const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { getMongoErrorDiagnostics } = require("./utils/mongoDiagnostics");
const { createCorsOptions } = require("./utils/corsOptions");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler");

const app = express();

/* ===========================
   Environment Variables
=========================== */

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing");
  process.exit(1);
}

/* ===========================
   Trust Proxy
=========================== */

app.set("trust proxy", 1);

/* ===========================
   Security
=========================== */

app.use(helmet());

app.use(compression());

/* ===========================
   Body Parser
=========================== */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* ===========================
   CORS
=========================== */

app.use(cors(createCorsOptions()));

/* ===========================
   Rate Limiter
=========================== */

const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 20,

  message: {
    message:
      "Too many login attempts. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

const apiLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    message:
      "Too many requests. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

/* ===========================
   Routes
=========================== */

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "LinkInBio Backend Running 🚀",
  });

});

app.use("/api/auth", authLimiter);
app.use("/api/user", apiLimiter);

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("API request deferred", {
      stage: "database-readiness",
      path: req.path,
      readyState: mongoose.connection.readyState,
    });
    return res.status(503).json({
      success: false,
      message: "The database is not connected yet. Please try again shortly.",
    });
  }
  return next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* ===========================
   404
=========================== */

app.use(notFoundHandler);

/* ===========================
   Error Handler
=========================== */

app.use(errorHandler);

/* ===========================
   MongoDB Connection
=========================== */

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

server.requestTimeout = 15_000;
server.headersTimeout = 20_000;

let isConnecting = false;
let retryTimer = null;
let retryCount = 0;
const MAX_CONNECT_RETRIES = 5;

const logConnectionState = (event) => {
  console.log(`MongoDB ${event}`, {
    pid: process.pid,
    readyState: mongoose.connection.readyState,
  });
};

const clearConnectionRetry = () => {
  retryCount = 0;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

const scheduleConnectionRetry = () => {
  if (retryTimer || isConnecting || mongoose.connection.readyState === 1) return;
  if (retryCount >= MAX_CONNECT_RETRIES) {
    console.error("MongoDB connection retries exhausted", {
      pid: process.pid,
      readyState: mongoose.connection.readyState,
      retryCount,
    });
    return;
  }

  retryCount += 1;
  const delayMs = Math.min(5_000 * (2 ** (retryCount - 1)), 30_000);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connectToDatabase();
  }, delayMs);
  retryTimer.unref();
};

const connectToDatabase = async () => {
  if (isConnecting || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
  isConnecting = true;
  const startedAt = Date.now();
  let retryAfterAttempt = false;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
    });
    clearConnectionRetry();
    console.log("MongoDB Connected", {
      pid: process.pid,
      readyState: mongoose.connection.readyState,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("MongoDB connection failed", {
      pid: process.pid,
      readyState: mongoose.connection.readyState,
      stage: "server-selection",
      elapsedMs: Date.now() - startedAt,
      ...getMongoErrorDiagnostics(error),
    });
    retryAfterAttempt = true;
  } finally {
    isConnecting = false;
    if (retryAfterAttempt) scheduleConnectionRetry();
  }
};

mongoose.connection.on("connected", () => {
  clearConnectionRetry();
  logConnectionState("connected");
});

mongoose.connection.on("disconnected", () => {
  logConnectionState("disconnected");
});

mongoose.connection.on("reconnected", () => {
  clearConnectionRetry();
  logConnectionState("reconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error", {
    pid: process.pid,
    readyState: mongoose.connection.readyState,
    ...getMongoErrorDiagnostics(error),
  });
});

connectToDatabase();

/* ===========================
   Process Handlers
=========================== */

process.on("unhandledRejection", (error) => {

  console.error("Unhandled Rejection");

  console.error({ name: error?.name, code: error?.code });

});

process.on("uncaughtException", (error) => {

  console.error("Uncaught Exception");

  console.error({ name: error?.name, code: error?.code });

});

module.exports = app;
