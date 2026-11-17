/**
 * Standardized API Response Helper
 */
// `extra` adds top-level fields such as `pagination` without changing `data`,
// so existing clients that read only `data` keep working.
const successResponse = (res, statusCode = 200, message = 'Success', data = null, extra = {}) => {
  return res.status(statusCode).json({
    ...extra,
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
