const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const {
  isValidUsername,
  isValidUrl,
  normalizeUsername,
  sanitizeText,
} = require("../utils/validators");

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return next(error);
  }
};

exports.getPublicProfile = async (req, res, next) => {
  try {
    const username = normalizeUsername(req.params.username);
    const user = await User.findOne({ username }).select("-password -email -_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return next(error);
  }
};

const isValidLinkEntry = (link) => {
  if (!link || typeof link !== "object") return false;
  if (!link.title || typeof link.title !== "string" || !link.title.trim()) return false;
  if (!link.url || typeof link.url !== "string") return false;
  return isValidUrl(link.url);
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { username, bio, avatarUrl, links } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username !== undefined) {
      const normalizedUsername = normalizeUsername(username);
      if (!isValidUsername(normalizedUsername)) {
        return res.status(400).json({
          message:
            "Username can only contain lowercase letters, numbers, or underscores",
        });
      }

      const existingUsername = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res.status(409).json({ message: "Username already in use" });
      }

      user.username = normalizedUsername;
    }

    if (bio !== undefined) {
      user.bio = sanitizeText(bio);
    }

    if (avatarUrl !== undefined) {
      let finalAvatarUrl = avatarUrl;
      if (typeof avatarUrl === "string" && avatarUrl.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(avatarUrl, {
          folder: "linkinbio_avatars",
          resource_type: "image",
        });
        finalAvatarUrl = uploadResponse.secure_url;
      }
      user.avatarUrl = finalAvatarUrl;
    }

    if (Array.isArray(links)) {
      const sanitizedLinks = links
        .filter(isValidLinkEntry)
        .map((link) => ({
          title: sanitizeText(link.title),
          url: link.url.trim(),
        }));

      user.links = sanitizedLinks;
    }

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return next(error);
  }
};
