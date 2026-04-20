const { Table, Order, OrderItem, MenuItem } = require('../models')

class TableService {
  async getAllTables(branchId) {
    const tables = await Table.findAll({
      where: { branchId },
      include: [
        {
          model: Order,
          where: { status: { [require('sequelize').Op.ne]: 'served' } },
          required: false
        }
      ]
    })
    return tables
  }

  async getTableById(id) {
    const table = await Table.findByPk(id, {
      include: [
        {
          model: Order,
          where: { status: { [require('sequelize').Op.ne]: 'served' } },
          required: false,
          include: [
            {
              model: OrderItem,
              include: [MenuItem]
            }
          ]
        }
      ]
    })

    if (!table) {
      throw new Error('Table not found')
    }

    return table
  }

  async createTable(branchId, data) {
    const table = await Table.create({
      branchId,
      ...data
    })
    return table
  }

  async updateTable(id, data) {
    const table = await Table.findByPk(id)
    if (!table) {
      throw new Error('Table not found')
    }

    await table.update(data)
    return table
  }

  async updateTableStatus(id, status) {
    const table = await Table.findByPk(id)
    if (!table) {
      throw new Error('Table not found')
    }

    await table.update({ status })
    return table
  }

  async deleteTable(id) {
    const table = await Table.findByPk(id)
    if (!table) {
      throw new Error('Table not found')
    }

    await table.destroy()
    return { message: 'Table deleted successfully' }
  }
}

module.exports = new TableService()
