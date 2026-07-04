const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};