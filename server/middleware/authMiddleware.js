const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next({ statusCode: 401, message: "Authorization header is required" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next({ statusCode: 401, message: "Authorization header must use Bearer scheme" });
  }

  if (!process.env.JWT_SECRET) {
    return next({ statusCode: 500, message: "JWT_SECRET is not configured" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return next({ statusCode: 401, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
