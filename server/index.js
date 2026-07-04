const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://linkinbio-mern.vercel.app",
];

if (!MONGO_URI) {
  console.error("Missing required environment variable: MONGO_URI");
  process.exit(1);
}

app.set("trust proxy", 1);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", apiLimiter, userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;
