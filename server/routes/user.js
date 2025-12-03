const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  getPublicProfile,
  updateProfile,
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

router.get("/me", auth, getCurrentUser);
router.put("/me", auth, updateProfile);

router.get("/:username", getPublicProfile);

module.exports = router;
