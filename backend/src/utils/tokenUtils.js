require('dotenv').config()
const jwt = require('jsonwebtoken')
const config = require('../config')

/**
 * Generate access token (short-lived)
 * Contains: sub (accountId), role, branchId, type, tokenVersion
 */
const generateAccessToken = (accountId, role, branchId, tokenVersion) => {
  return jwt.sign(
    {
      sub: accountId,
      role: role || 'guest',
      branchId: branchId || null,
      type: 'access',
      tokenVersion,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRY }
  )
}

/**
 * Generate refresh token (long-lived, stored as HttpOnly cookie)
 * Contains: sub (accountId), type, tokenVersion
 */
const generateRefreshToken = (accountId, tokenVersion) => {
  return jwt.sign(
    {
      sub: accountId,
      type: 'refresh',
      tokenVersion,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRY }
  )
}

/**
 * Generate both tokens
 */
const generateTokenPair = (accountId, role, branchId, tokenVersion) => {
  return {
    accessToken: generateAccessToken(accountId, role, branchId, tokenVersion),
    refreshToken: generateRefreshToken(accountId, tokenVersion),
  }
}

/**
 * Verify token and return payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  return jwt.decode(token)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken,
}
