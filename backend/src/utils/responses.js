/**
 * Consistent JSON response helpers
 */

const success = (data, message = 'Success', statusCode = 200) => ({
  status: statusCode,
  message,
  data,
})

const paginated = (data, page, limit, total, message = 'Success', statusCode = 200) => ({
  status: statusCode,
  message,
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
})

const error = (code, message, statusCode = 500, errors = null) => ({
  status: statusCode,
  code,
  message,
  ...(errors && { errors }),
})

module.exports = {
  success,
  paginated,
  error,
}
