/**
 * BaseRepository - Wrapper around Sequelize models
 * Provides a testable interface for data access
 * Services depend on repositories, not ORM directly
 */
class BaseRepository {
  constructor(model) {
    this.model = model
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options)
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options })
  }

  async findAll(where = {}, options = {}) {
    return this.model.findAll({ where, ...options })
  }

  async findAndCount(where = {}, options = {}) {
    const { limit = 20, offset = 0, ...otherOptions } = options
    return this.model.findAndCountAll({
      where,
      limit,
      offset,
      ...otherOptions,
    })
  }

  async create(data) {
    return this.model.create(data)
  }

  async update(where, data) {
    return this.model.update(data, { where, returning: true })
  }

  async updateById(id, data) {
    const [_, updated] = await this.model.update(data, {
      where: { id },
      returning: true,
    })
    return updated[0] || null
  }

  async delete(where) {
    return this.model.destroy({ where })
  }

  async deleteById(id) {
    return this.model.destroy({ where: { id } })
  }

  async count(where = {}) {
    return this.model.count({ where })
  }

  async transaction(callback) {
    const sequelize = this.model.sequelize
    const transaction = await sequelize.transaction()
    try {
      const result = await callback(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async bulkCreate(data, options = {}) {
    return this.model.bulkCreate(data, options)
  }
}

module.exports = BaseRepository
