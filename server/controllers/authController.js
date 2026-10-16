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

// =======================================
// Generate JWT Token
// =======================================

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing.");
  }

  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );
};

// =======================================
// Create Safe User Response
// =======================================

const createUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
});

// =======================================
// SIGNUP
// =======================================

exports.signup = async (req, res, next) => {
  try {
    let { email, password, username } = req.body;

    email = normalizeEmail(email);
    username = normalizeUsername(username);

    // Required Fields
    if (!email || !password || !username) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Email Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Username Validation
    if (!isValidUsername(username)) {
      return res.status(400).json({
        message:
          "Username must contain only lowercase letters, numbers, or underscores (3-20 characters).",
      });
    }

    // Password Validation
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }

    // Existing Email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    // Existing Username
    const existingUsername = await User.findOne({
      $or: [{ username }, { usernameAliases: username }],
    });

    if (existingUsername) {
      return res.status(409).json({
        message: "Username already taken.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_ROUNDS) || 10
    );

    // Create User
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("Signup request failed", { name: error.name, code: error.code });
    next(error);
  }
};

// =======================================
// LOGIN
// =======================================

exports.login = async (req, res, next) => {
  let stage = "request-validation";
  const startedAt = Date.now();
  try {
    let { email, password } = req.body;

    email = normalizeEmail(email);

    // Required Fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Validate Email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Password is select:false in the schema; login must opt in to verify it.
    stage = "user-lookup";
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Compare Password
    stage = "password-verification";
    const passwordMatched = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    stage = "token-creation";
    const token = generateToken(user._id);

    stage = "response";
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: createUserResponse(user),
    });
  } catch (error) {
    console.error("Login request failed", {
      stage,
      elapsedMs: Date.now() - startedAt,
      name: error.name,
      code: error.code,
    });
    next(error);
  }
};
