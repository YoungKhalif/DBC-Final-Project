require('dotenv').config()
const jwt = require('jsonwebtoken')

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRATION || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret')
  } catch (error) {
    return null
  }
}

const decodeToken = (token) => {
  return jwt.decode(token)
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
}
