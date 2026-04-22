const AuthService = require('../services/authService')
const { success } = require('../utils/responses')
const { decodeToken } = require('../utils/tokenUtils')

/**
 * Auth controller - handles HTTP request/response
 * All business logic delegated to AuthService
 */

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.validatedBody

    const user = await AuthService.register(email, password, firstName, lastName, phone)

    res.status(201).json(success(user, 'Account created successfully', 201))
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody

    const result = await AuthService.login(email, password)

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json(
      success(
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
        'Login successful'
      )
    )
  } catch (error) {
    next(error)
  }
}

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new TokenError('Refresh token not found')
    }

    const decoded = decodeToken(refreshToken)
    if (!decoded) {
      throw new TokenError('Invalid refresh token')
    }

    const result = await AuthService.refresh(decoded.sub, decoded.tokenVersion)

    // Set new refresh token as HttpOnly cookie (rotation)
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json(
      success(
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
        'Token refreshed'
      )
    )
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    const { id: accountId } = req.user

    await AuthService.logout(accountId)

    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    res.json(success(null, 'Logged out successfully'))
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { id: accountId } = req.user
    const { oldPassword, newPassword } = req.validatedBody

    await AuthService.changePassword(accountId, oldPassword, newPassword)

    // Clear refresh token to force re-login
    res.clearCookie('refreshToken')

    res.json(success(null, 'Password changed successfully'))
  } catch (error) {
    next(error)
  }
}

const getCurrentUser = (req, res) => {
  res.json(success(req.user, 'Current user'))
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getCurrentUser,
}
