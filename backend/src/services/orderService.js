const { Order, OrderItem, MenuItem, Bill, Table } = require('../models')
const { Op } = require('sequelize')

class OrderService {
  async createOrder(tableId, waiterId, items) {
    // Create order
    const order = await Order.create({
      tableId,
      waiterId,
      status: 'pending',
      totalAmount: 0
    })

    // Add items to order
    let totalAmount = 0
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId)
      if (!menuItem) {
        throw new Error(`MenuItem ${item.menuItemId} not found`)
      }

      const subtotal = parseFloat(menuItem.price) * item.quantity
      totalAmount += subtotal

      await OrderItem.create({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal,
        specialRequests: item.specialRequests || null
      })
    }

    // Update order total
    await order.update({ totalAmount })

    return this.getOrderById(order.id)
  }

  async getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        },
        { model: Table, as: 'table' },
        { model: require('../models').Account, as: 'waiter' }
      ]
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  }

  async getOrdersByTableId(tableId) {
    const orders = await Order.findAll({
      where: {
        tableId,
        status: { [Op.ne]: 'served' }
      },
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        }
      ]
    })

    return orders
  }

  async updateOrderStatus(id, status) {
    const order = await Order.findByPk(id)
    if (!order) {
      throw new Error('Order not found')
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: [],
      cancelled: []
    }

    if (!validTransitions[order.status]?.includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`)
    }

    await order.update({ status })
    return this.getOrderById(id)
  }

  async updateOrderItemStatus(orderItemId, status) {
    const orderItem = await OrderItem.findByPk(orderItemId)
    if (!orderItem) {
      throw new Error('Order item not found')
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'cancelled'],
      served: [],
      cancelled: []
    }

    if (!validTransitions[orderItem.status]?.includes(status)) {
      throw new Error(`Cannot transition from ${orderItem.status} to ${status}`)
    }

    await orderItem.update({ status })
    return orderItem
  }

  async getOrdersByStatus(status, branchId = null) {
    const where = { status }
    if (branchId) {
      // Would need join logic for branch filtering
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        },
        { model: Table }
      ]
    })

    return orders
  }
}

module.exports = new OrderService()
