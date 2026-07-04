const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  normalizeEmail,
  normalizeUsername,
} = require("../utils/validators");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

const createUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

exports.signup = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);
    const password = req.body.password;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain a number and uppercase letter",
      });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        message:
          "Username can only contain lowercase letters, numbers, or underscores",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const message = existingUser.email === email ? "Email already in use" : "Username already in use";
      return res.status(409).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    const token = generateToken(user._id);
    return res.status(201).json({ token, user: createUserResponse(user) });
  } catch (err) {
    console.error("Signup Error:", err);
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.json({ token, user: createUserResponse(user) });
  } catch (err) {
    console.error("Login Error:", err);
    return next(err);
  }
};
