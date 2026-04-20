const { Account } = require('../models')
const { hashPassword, comparePassword } = require('../utils/passwordUtils')
const { generateToken } = require('../utils/tokenUtils')

class AuthService {
  async register(data) {
    const { email, password, firstName, lastName, phone, role } = data

    // Check if account already exists
    const existingAccount = await Account.findOne({ where: { email } })
    if (existingAccount) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create account
    const account = await Account.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'guest'
    })

    return this.formatAccount(account)
  }

  async login(email, password) {
    const account = await Account.findOne({ where: { email } })

    if (!account) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await comparePassword(password, account.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await account.update({ lastLogin: new Date() })

    // Generate token
    const token = generateToken({
      id: account.id,
      email: account.email,
      role: account.role
    })

    return {
      token,
      user: this.formatAccount(account)
    }
  }

  async getAccountById(id) {
    const account = await Account.findByPk(id)
    if (!account) {
      throw new Error('Account not found')
    }
    return this.formatAccount(account)
  }

  async updateAccount(id, data) {
    const account = await Account.findByPk(id)
    if (!account) {
      throw new Error('Account not found')
    }

    // Hash password if provided
    if (data.password) {
      data.password = await hashPassword(data.password)
    }

    await account.update(data)
    return this.formatAccount(account)
  }

  formatAccount(account) {
    const { password, ...accountData } = account.toJSON()
    return accountData
  }
}

module.exports = new AuthService()
