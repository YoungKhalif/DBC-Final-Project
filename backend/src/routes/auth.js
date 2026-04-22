const express = require('express')
const { authenticate } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const authController = require('../controllers/authController')
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validation/schemas')

const router = express.Router()

/**
 * POST /api/auth/register
 * Register new account
 */
router.post('/register', validateBody(registerSchema), authController.register)

/**
 * POST /api/auth/login
 * Login and get access + refresh tokens
 */
router.post('/login', validateBody(loginSchema), authController.login)

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
router.post('/refresh', authController.refresh)

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh tokens
 */
router.post('/logout', authenticate, authController.logout)

/**
 * POST /api/auth/change-password
 * Change password (forces re-login)
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword
)

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, authController.getCurrentUser)

module.exports = router



// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const account = await authService.getAccountById(req.user.id)

    const { comparePassword } = require('../utils/passwordUtils')
    const isValid = await comparePassword(oldPassword, account.password)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid current password' })
    }

    await authService.updateAccount(req.user.id, { password: newPassword })
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
