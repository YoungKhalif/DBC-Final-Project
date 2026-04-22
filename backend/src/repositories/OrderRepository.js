const BaseRepository = require('./BaseRepository')
const { Order, Meal, MealItem, Table } = require('../models')

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order)
  }

  async findWithDetails(orderId) {
    return this.model.findByPk(orderId, {
      include: [
        {
          model: Meal,
          include: [
            {
              model: MealItem,
              include: [{ association: 'menuItem', attributes: ['id', 'name', 'price'] }],
            },
          ],
        },
        { model: Table, attributes: ['id', 'tableNumber', 'capacity'] },
      ],
    })
  }

  async findByTable(tableId, { excludeStatuses = ['closed'] } = {}) {
    return this.model.findAll({
      where: {
        table_id: tableId,
        ...(excludeStatuses.length > 0 && { status: { [Op.notIn]: excludeStatuses } }),
      },
      include: [
        {
          model: Meal,
          include: [{ model: MealItem }],
        },
      ],
      order: [['placed_at', 'DESC']],
    })
  }
}

module.exports = OrderRepository
