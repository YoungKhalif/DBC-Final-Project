const OrderService = require('../services/OrderService')
const { success } = require('../utils/responses')

const createOrder = async (req, res, next) => {
  try {
    const { table_id, meals } = req.validatedBody
    const { id: waiterId } = req.user

    const order = await OrderService.createOrder(table_id, waiterId, meals)
    res.status(201).json(success(order, 'Order created', 201))
  } catch (error) {
    next(error)
  }
}

const submitOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const order = await OrderService.submitOrder(orderId)
    res.json(success(order, 'Order submitted'))
  } catch (error) {
    next(error)
  }
}

const getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const order = await OrderService.getOrder(orderId)
    res.json(success(order, 'Order details'))
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { status } = req.validatedBody
    const order = await OrderService.updateOrderStatus(orderId, status)
    res.json(success(order, 'Order status updated'))
  } catch (error) {
    next(error)
  }
}

const getTableOrders = async (req, res, next) => {
  try {
    const { tableId } = req.params
    const orders = await OrderService.getTableOrders(tableId)
    res.json(success(orders, 'Table orders'))
  } catch (error) {
    next(error)
  }
}

const updateMealItemStatus = async (req, res, next) => {
  try {
    const { mealItemId } = req.params
    const { status } = req.validatedBody
    const { role } = req.user
    const item = await OrderService.updateMealItemStatus(mealItemId, status, role)
    res.json(success(item, 'Meal item status updated'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createOrder,
  submitOrder,
  getOrder,
  updateOrderStatus,
  getTableOrders,
  updateMealItemStatus,
}
