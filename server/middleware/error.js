export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
}

/** Wrap async route handlers so rejections reach errorHandler. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
