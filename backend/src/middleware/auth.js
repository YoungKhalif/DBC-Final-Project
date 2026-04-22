const { TokenError, ForbiddenError, AuthError } = require('../utils/errors')
const { verifyToken } = require('../utils/tokenUtils')
const { Account, Staff } = require('../models')

/**
 * Authentication middleware: validates JWT access token
 * Verifies token signature, expiry, and tokenVersion match
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new TokenError('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      throw new TokenError('Invalid or expired token')
    }

    // Verify token type is 'access'
    if (decoded.type !== 'access') {
      throw new TokenError('Invalid token type')
    }

    // Load account and check tokenVersion matches (refresh token rotation)
    const account = await Account.findByPk(decoded.sub, {
      include: [
        {
          model: Staff,
          required: false,
          attributes: ['id', 'role', 'branch_id', 'hireDate'],
        },
      ],
    })

    if (!account) {
      throw new AuthError('Account not found')
    }

    if (!account.isActive) {
      throw new AuthError('Account is inactive')
    }

    // Check tokenVersion matches (if it changed, refresh tokens were rotated)
    if (decoded.tokenVersion !== account.tokenVersion) {
      throw new TokenError('Token has been invalidated')
    }

    // Attach user to request
    req.user = {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.Staff?.role || 'guest',
      branchId: account.Staff?.branch_id || null,
      isStaff: !!account.Staff,
    }

    next()
  } catch (error) {
    if (error instanceof TokenError || error instanceof AuthError) {
      return next(error)
    }
    next(new TokenError('Authentication failed'))
  }
}

/**
 * Authorization middleware: checks user role
 * Usage: authorize('manager', 'receptionist')
 */
const authorize = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('Authentication required'))
    }

    if (requiredRoles.length === 0) {
      return next()
    }

    if (!requiredRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Requires one of: ${requiredRoles.join(', ')}, your role: ${req.user.role}`
        )
      )
    }

    next()
  }
}

/**
 * Verify user is staff only (no guests)
 */
const requireStaff = (req, res, next) => {
  if (!req.user?.isStaff) {
    return next(new ForbiddenError('Staff account required'))
  }
  next()
}

/**
 * Verify user owns this branch
 */
const requireBranch = (branchIdParam = 'branchId') => {
  return (req, res, next) => {
    const requiredBranchId = req.params[branchIdParam] || req.query.branchId

    if (!req.user?.branchId) {
      return next(new ForbiddenError('Staff access required'))
    }

    if (req.user.branchId !== requiredBranchId) {
      return next(new ForbiddenError('Cannot access this branch'))
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  requireStaff,
  requireBranch,
}

