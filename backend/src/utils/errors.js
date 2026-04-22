/**
 * Base application error class
 * All thrown errors should extend this for consistent handling
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    }
  }
}

class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 422, 'VALIDATION_ERROR')
    this.errors = errors
  }

  toJSON() {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    }
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
  }
}

class TokenError extends AppError {
  constructor(message = 'Invalid or expired token') {
    super(message, 401, 'TOKEN_ERROR')
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

class StateTransitionError extends AppError {
  constructor(from, to, message = null) {
    super(
      message || `Invalid state transition from ${from} to ${to}`,
      422,
      'INVALID_STATE_TRANSITION'
    )
    this.from = from
    this.to = to
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  TokenError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  StateTransitionError,
}
