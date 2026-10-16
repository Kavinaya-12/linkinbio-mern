const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const code = err.code;
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  let message = "Something went wrong. Please try again.";

  if (err.avatarStorageError) {
    statusCode = 503;
    message = "Avatar storage is temporarily unavailable. Your profile was not published; try again shortly.";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map(({ message: itemMessage }) => itemMessage).join(", ");
  } else if (code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists.` : "This value is already in use.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "That profile could not be found.";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Your sign-in session is invalid. Please sign in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your sign-in session has expired. Please sign in again.";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "That image is too large. Choose an image under 5 MB.";
  } else if (statusCode >= 500) {
    statusCode = 500;
  } else if (typeof err.message === "string" && err.message.length < 180) {
    message = err.message;
  }

  console.error("Request failed", {
    name: err.name || "Error",
    code: code || undefined,
    statusCode,
  });

  return res.status(statusCode).json({ success: false, message });
};

const notFoundHandler = (req, res) => res.status(404).json({
  success: false,
  message: "We could not find that page or action.",
});

module.exports = { errorHandler, notFoundHandler };
