const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const orderService = require('../services/orderService')

// Create order
router.post('/', authenticate, authorize(['waiter']), async (req, res) => {
  try {
    const { tableId, items } = req.body
    const order = await orderService.createOrder(tableId, req.user.id, items)
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id)
    res.json(order)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Get orders by table
router.get('/table/:tableId', authenticate, async (req, res) => {
  try {
    const orders = await orderService.getOrdersByTableId(req.params.tableId)
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get orders by status
router.get('/status/:status', authenticate, authorize(['chef', 'manager']), async (req, res) => {
  try {
    const orders = await orderService.getOrdersByStatus(req.params.status)
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update order status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    const order = await orderService.updateOrderStatus(req.params.id, status)
    res.json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update order item status
router.patch('/item/:itemId/status', authenticate, authorize(['chef']), async (req, res) => {
  try {
    const { status } = req.body
    const item = await orderService.updateOrderItemStatus(req.params.itemId, status)
    res.json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
