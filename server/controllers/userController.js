const User = require("../models/User");
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -email -_id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, bio, avatarUrl, links } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username !== undefined) user.username = username.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();

    if (Array.isArray(links)) {
      const validLinks = links.filter((link) => {
        try {
          if (!link.title || !link.title.trim()) return false;
          const parsed = new URL(link.url);
          if (parsed.protocol !== "https:") return false;
          if (!parsed.hostname || parsed.hostname.length < 3) return false;
          return true;
        } catch {
          return false;
        }
      });

      user.links = validLinks;
    }

    await user.save();

       const updatedUser = await User.findById(userId).select("-password");
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};