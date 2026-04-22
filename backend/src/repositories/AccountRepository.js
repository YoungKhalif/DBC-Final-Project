const BaseRepository = require('./BaseRepository')
const { Account, Staff } = require('../models')

class AccountRepository extends BaseRepository {
  constructor() {
    super(Account)
  }

  async findByEmail(email) {
    return this.model.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Staff, attributes: ['id', 'role', 'branch_id'] }],
    })
  }

  async findWithStaff(id) {
    return this.model.findByPk(id, {
      include: [{ model: Staff, attributes: ['id', 'role', 'branch_id', 'hireDate'] }],
    })
  }

  async incrementTokenVersion(id) {
    const [_, updated] = await this.model.update(
      { tokenVersion: this.model.sequelize.literal('token_version + 1') },
      { where: { id }, returning: true }
    )
    return updated[0] || null
  }

  async updateLastLogin(id) {
    return this.updateById(id, { lastLogin: new Date() })
  }
}

module.exports = AccountRepository
