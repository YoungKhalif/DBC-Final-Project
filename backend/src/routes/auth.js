const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const authService = require('../services/authService')
const { authenticate } = require('../middleware/auth')

// Validation middleware
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty()
]

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
]

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Register
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json({ user })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body
    const { token, user } = await authService.login(email, password)
    res.json({ token, user })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getAccountById(req.user.id)
    res.json(user)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body
    const user = await authService.updateAccount(req.user.id, {
      firstName,
      lastName,
      phone
    })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

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
