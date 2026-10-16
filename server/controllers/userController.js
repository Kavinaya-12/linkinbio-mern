const User = require("../models/User");
const AnalyticsEvent = require("../models/AnalyticsEvent");
const { createHash } = require("node:crypto");
const {
  getSupabaseConfigError,
  parseAvatarDataUrl,
  uploadAvatar,
  getOwnedObjectPath,
  removeAvatar,
} = require("../utils/supabaseStorage");

const {
  isValidUsername,
  normalizeUsername,
  sanitizeBio,
  sanitizeLinks,
  haveUniqueLinks,
  areLinksPublishable,
  sanitizeTheme,
} = require("../utils/validators");

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Profile read failed", { name: error.name, code: error.code });
    next(error);
  }
};


exports.getPublicProfile = async (req, res, next) => {
  try {
    const username = normalizeUsername(req.params.username);

    const user = await User.findOne({
      $or: [{ username }, { usernameAliases: username }],
    }).select("-password -email -__v -usernameAliases");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Public profile read failed", { name: error.name, code: error.code });
    next(error);
  }
};


exports.updateProfile = async (req, res, next) => {
  let uploadedAvatarPath = null;
  let existingAvatarUrl = null;
  let profileSaved = false;
  try {
    const { username, bio, avatarUrl, links, theme } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    existingAvatarUrl = user.avatarUrl;


    if (links !== undefined) {
      if (!areLinksPublishable(links)) {
        return res.status(400).json({ message: "Each link needs a title and a valid HTTPS URL. Titles may be up to 40 characters, with at most 10 links." });
      }
      const cleanedLinks = sanitizeLinks(links);
      if (!haveUniqueLinks(cleanedLinks)) {
        return res.status(400).json({ message: "Link titles and URLs must be unique." });
      }
    }

    if (username !== undefined) {
      const normalizedUsername = normalizeUsername(username);

      if (!isValidUsername(normalizedUsername)) {
        return res.status(400).json({
          message:
            "Username must contain only lowercase letters, numbers or underscores (3-20 characters).",
        });
      }

      const usernameExists = await User.findOne({
        $or: [
          { username: normalizedUsername },
          { usernameAliases: normalizedUsername },
        ],
        _id: { $ne: req.userId },
      });

      if (usernameExists) {
        return res.status(409).json({
          message: "Username already taken.",
        });
      }

      if (normalizedUsername !== user.username) {
        user.usernameAliases = [...new Set([...(user.usernameAliases || []), user.username])]
          .filter((alias) => alias !== normalizedUsername)
          .slice(-20);
        user.username = normalizedUsername;
      }
    }


    if (bio !== undefined) {
      user.bio = sanitizeBio(bio);
    }


    if (links !== undefined) {
      user.links = sanitizeLinks(links);
    }

    if (theme !== undefined) {
      const normalizedTheme = sanitizeTheme(theme);
      if (!normalizedTheme) {
        return res.status(400).json({
          message: "Theme colors must be six-digit hex values and link style must be supported.",
        });
      }
      user.theme = normalizedTheme;
    }


    if (avatarUrl !== undefined) {
      let finalAvatar = avatarUrl;

      if (typeof avatarUrl === "string" && avatarUrl.startsWith("data:")) {
        const supabaseConfigError = getSupabaseConfigError();
        if (supabaseConfigError) {
          return res.status(503).json({
            success: false,
            code: "SUPABASE_CONFIGURATION",
            message: supabaseConfigError,
          });
        }
        const parsedImage = parseAvatarDataUrl(avatarUrl);
        if (parsedImage.error) return res.status(400).json({ success: false, message: parsedImage.error });

        const uploaded = await uploadAvatar({ ownerId: String(user._id), ...parsedImage });
        uploadedAvatarPath = uploaded.objectPath;
        finalAvatar = uploaded.publicUrl;
      } else if (avatarUrl !== "" && avatarUrl !== existingAvatarUrl) {
        return res.status(400).json({ success: false, message: "Choose an avatar using the profile image uploader." });
      }

      user.avatarUrl = finalAvatar;
    }


    await user.save();
    profileSaved = true;

    if (avatarUrl !== undefined && avatarUrl !== existingAvatarUrl) {
      const previousAvatarPath = getOwnedObjectPath(existingAvatarUrl, String(user._id));
      if (previousAvatarPath && previousAvatarPath !== uploadedAvatarPath) {
        try {
          await removeAvatar(previousAvatarPath);
        } catch {
          console.warn("Old profile image cleanup failed after a successful profile save.");
        }
      }
    }

    const updatedUser = await User.findById(req.userId).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    if (!profileSaved && uploadedAvatarPath) {
      try {
        await removeAvatar(uploadedAvatarPath);
      } catch {
        console.warn("Unpublished profile image cleanup failed.");
      }
    }
    next(error);
  }
};

const getVisitorHash = (req) => createHash("sha256")
  .update(`${req.ip || "unknown"}\n${req.get("user-agent") || "unknown"}`)
  .digest("hex");

const storePublicEvent = async (req, res, next, type, linkUrl = "") => {
  try {
    const username = normalizeUsername(req.params.username);
    if (!isValidUsername(username)) {
      return res.status(400).json({ message: "Invalid profile username." });
    }

    const user = await User.findOne({ $or: [{ username }, { usernameAliases: username }] }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found." });

    const windowBucket = Math.floor(Date.now() / (30 * 60 * 1000));
    try {
      await AnalyticsEvent.create({
        ownerId: user._id,
        type,
        linkUrl,
        visitorHash: getVisitorHash(req),
        windowBucket,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(200).json({ recorded: false, reason: "duplicate" });
      }
      throw error;
    }

    return res.status(201).json({ recorded: true });
  } catch (error) {
    return next(error);
  }
};

exports.recordProfileView = (req, res, next) =>
  storePublicEvent(req, res, next, "view");

exports.recordLinkClick = async (req, res, next) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0) {
    return res.status(400).json({ message: "Invalid link index." });
  }

  try {
    const username = normalizeUsername(req.params.username);
    if (!isValidUsername(username)) {
      return res.status(400).json({ message: "Invalid profile username." });
    }

    const user = await User.findOne({ $or: [{ username }, { usernameAliases: username }] }).select("links");
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.links[index]) return res.status(404).json({ message: "Link not found." });

    return storePublicEvent(req, res, next, "click", user.links[index].url);
  } catch (error) {
    return next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.userId;
    const [views, clickEvents] = await Promise.all([
      AnalyticsEvent.countDocuments({ ownerId, type: "view" }),
      AnalyticsEvent.find({ ownerId, type: "click" }).select("linkUrl").lean(),
    ]);

    const clicksByUrl = new Map();
    for (const { linkUrl } of clickEvents) {
      clicksByUrl.set(linkUrl, (clicksByUrl.get(linkUrl) || 0) + 1);
    }
    const links = (await User.findById(ownerId).select("links").lean())?.links || [];
    const linkStats = links.map(({ title, url }) => ({
      title,
      url,
      clicks: clicksByUrl.get(url) || 0,
    }));
    const clicks = clickEvents.length;
    const mostClickedLink = linkStats.reduce(
      (mostClicked, link) => link.clicks > (mostClicked?.clicks || 0) ? link : mostClicked,
      null
    );

    return res.status(200).json({ views, clicks, links: linkStats, mostClickedLink });
  } catch (error) {
    return next(error);
  }
};
