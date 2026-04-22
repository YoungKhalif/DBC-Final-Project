const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const orderController = require('../controllers/orderController')
const { createOrderSchema, updateOrderStatusSchema, updateMealItemStatusSchema } = require('../validation/schemas')

const router = express.Router()

/**
 * POST /api/orders
 * Create order in draft state
 */
router.post('/', authenticate, authorize('waiter'), validateBody(createOrderSchema), orderController.createOrder)

/**
 * GET /api/orders/:orderId
 * Get order with all details
 */
router.get('/:orderId', authenticate, orderController.getOrder)

/**
 * POST /api/orders/:orderId/submit
 * Submit order (draft → submitted)
 */
router.post('/:orderId/submit', authenticate, authorize('waiter'), orderController.submitOrder)

/**
 * PATCH /api/orders/:orderId/status
 * Update order status with state machine validation
 */
router.patch('/:orderId/status', authenticate, authorize('manager', 'chef'), validateBody(updateOrderStatusSchema), orderController.updateOrderStatus)

/**
 * GET /api/orders/table/:tableId
 * Get all active orders for a table
 */
router.get('/table/:tableId', authenticate, orderController.getTableOrders)

/**
 * PATCH /api/orders/meal-items/:mealItemId/status
 * Update meal item status (chef or waiter)
 */
router.patch('/meal-items/:mealItemId/status', authenticate, authorize('chef', 'waiter'), validateBody(updateMealItemStatusSchema), orderController.updateMealItemStatus)

module.exports = router
