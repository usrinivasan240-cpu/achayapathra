/* eslint-disable no-console */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${req.method}] ${req.originalUrl} -> ${status}`, err);
  }

  return res.status(status).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
};

module.exports = errorHandler;
