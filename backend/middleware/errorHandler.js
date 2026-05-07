function errorHandler(error, _req, res, _next) {
  const status = error.status || error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(status).json({
    error: status >= 500 && isProduction ? "Internal server error." : error.message,
    status
  });
}

module.exports = errorHandler;
