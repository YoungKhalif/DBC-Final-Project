const { verifyToken } = require('../utils/tokenUtils')
const { Account, Staff } = require('../models')

/**
 * Authentication middleware: validates JWT token
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Load full account with staff details if applicable
    const account = await Account.findByPk(decoded.id, {
      include: [
        {
          model: Staff,
          required: false,
          attributes: ['id', 'role', 'branch_id'],
        },
      ],
    })

    if (!account || !account.isActive) {
      return res.status(401).json({ error: 'Account not found or inactive' })
    }

    req.user = {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      account_type: account.account_type,
      staff: account.Staff || null,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

/**
 * Authorization middleware: checks user role
 * Usage: authorize(['manager', 'chef'])
 * Guests can be authorized with ['guest']
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Guests have account_type='guest', no staff record
    if (req.user.account_type === 'guest') {
      if (!allowedRoles.includes('guest')) {
        return res.status(403).json({ error: 'This action requires staff account' })
      }
      return next()
    }

    // Staff must have a role in the allowed list
    if (!req.user.staff || allowedRoles.length === 0) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (!allowedRoles.includes(req.user.staff.role)) {
      return res.status(403).json({
        error: `This action requires one of: ${allowedRoles.join(', ')}`,
      })
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
}
