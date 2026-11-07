const { errorResponse } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const describeFieldError = (fieldError) =>
  fieldError.name === 'CastError' ? `Invalid value for ${fieldError.path}.` : fieldError.message;

// Maps errors to what is safe to show a client. Anything unrecognised becomes a
// generic 500, because raw messages expose database and internal details.
const toClientError = (err, res) => {
  if (err.name === 'CastError') {
    return { statusCode: 400, message: describeFieldError(err) };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(describeFieldError).join(' ');
    return { statusCode: 400, message };
  }

  if (err.code === 11000) {
    return { statusCode: 409, message: 'A record with these details already exists.' };
  }

  // Body-parser and similar middleware errors carry their own 4xx status
  if (err.status >= 400 && err.status < 500) {
    return { statusCode: err.status, message: err.message };
  }

  if (res.statusCode >= 400 && res.statusCode < 500) {
    return { statusCode: res.statusCode, message: err.message };
  }

  return { statusCode: 500, message: 'Internal Server Error' };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = toClientError(err, res);

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
