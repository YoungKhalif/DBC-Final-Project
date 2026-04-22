const { AppError } = require('../utils/errors')
const logger = require('../config/logger')

/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // AppError subclass
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON())
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }))
    return res.status(422).json({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    })
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'unknown'
    return res.status(409).json({
      status: 409,
      code: 'CONFLICT',
      message: `${field} already exists`,
    })
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 400,
      code: 'INVALID_REFERENCE',
      message: 'Referenced record not found',
    })
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
    return res.status(422).json({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    })
  }

  // Unknown error - don't leak details in production
  const statusCode = err.statusCode || 500
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'

  return res.status(statusCode).json({
    status: statusCode,
    code: 'INTERNAL_ERROR',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler

