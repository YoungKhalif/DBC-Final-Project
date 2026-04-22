const bcrypt = require('bcrypt')
const AccountRepository = require('../repositories/AccountRepository')
const {
  AuthError,
  TokenError,
  ConflictError,
  ValidationError,
} = require('../utils/errors')
const { generateTokenPair } = require('../utils/tokenUtils')

/**
 * AuthService - Handles authentication, token generation, and refresh rotation
 */
class AuthService {
  constructor() {
    this.accountRepo = new AccountRepository()
  }

  /**
   * Register new account
   */
  async register(email, password, firstName, lastName, phone = null) {
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError('Missing required fields')
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    // Check email doesn't exist
    const existing = await this.accountRepo.findByEmail(email)
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create account
    const account = await this.accountRepo.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      isActive: true,
      tokenVersion: 0,
    })

    return {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
    }
  }

  /**
   * Login and generate token pair
   */
  async login(email, password) {
    if (!email || !password) {
      throw new AuthError('Email and password required')
    }

    // Find account
    const account = await this.accountRepo.findByEmail(email)
    if (!account) {
      throw new AuthError('Invalid email or password')
    }

    if (!account.isActive) {
      throw new AuthError('Account is inactive')
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, account.password)
    if (!passwordValid) {
      throw new AuthError('Invalid email or password')
    }

    // Update last login
    await this.accountRepo.updateLastLogin(account.id)

    // Generate tokens
    const role = account.Staff?.role || 'guest'
    const branchId = account.Staff?.branch_id || null

    const tokens = generateTokenPair(account.id, role, branchId, account.tokenVersion)

    return {
      user: {
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role,
        branchId,
        isStaff: !!account.Staff,
      },
      tokens,
    }
  }

  /**
   * Refresh access token using refresh token
   * Rotates refresh token by incrementing tokenVersion
   */
  async refresh(accountId, currentTokenVersion) {
    const account = await this.accountRepo.findWithStaff(accountId)
    if (!account) {
      throw new AuthError('Account not found')
    }

    if (!account.isActive) {
      throw new AuthError('Account is inactive')
    }

    // Check tokenVersion hasn't changed (no logout/password change)
    if (account.tokenVersion !== currentTokenVersion) {
      throw new TokenError('Token has been invalidated')
    }

    const role = account.Staff?.role || 'guest'
    const branchId = account.Staff?.branch_id || null

    // Generate new token pair (includes old tokenVersion)
    const tokens = generateTokenPair(account.id, role, branchId, account.tokenVersion)

    return {
      user: {
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role,
        branchId,
        isStaff: !!account.Staff,
      },
      tokens,
    }
  }

  /**
   * Logout - increment tokenVersion to invalidate all refresh tokens
   */
  async logout(accountId) {
    await this.accountRepo.incrementTokenVersion(accountId)
    return { message: 'Logged out successfully' }
  }

  /**
   * Change password - increments tokenVersion to force re-login
   */
  async changePassword(accountId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new ValidationError('Old and new passwords required')
    }

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters')
    }

    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new AuthError('Account not found')
    }

    // Verify old password
    const passwordValid = await bcrypt.compare(oldPassword, account.password)
    if (!passwordValid) {
      throw new AuthError('Current password is incorrect')
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await this.accountRepo.updateById(accountId, { password: hashedPassword })

    // Increment tokenVersion to force all clients to re-authenticate
    await this.accountRepo.incrementTokenVersion(accountId)

    return { message: 'Password changed successfully' }
  }
}

module.exports = new AuthService()
