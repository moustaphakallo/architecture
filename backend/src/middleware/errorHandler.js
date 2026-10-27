function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource ID' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }
  return res.status(status).json({
    message: status >= 500 ? 'Internal server error' : error.message,
  });
}

module.exports = { errorHandler, notFound };
