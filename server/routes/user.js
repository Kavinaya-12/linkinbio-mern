const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getCurrentUser,
  updateProfile,
  getPublicProfile,
  getAnalytics,
  recordProfileView,
  recordLinkClick,
} = require("../controllers/userController");
const rateLimit = require("express-rate-limit");

const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many analytics events. Please try again later." },
});

router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateProfile);
router.get("/me/analytics", authMiddleware, getAnalytics);
router.post("/:username/track/view", analyticsLimiter, recordProfileView);
router.post("/:username/track/click/:index", analyticsLimiter, recordLinkClick);
router.get("/:username", getPublicProfile);
module.exports = router;
