const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const paymentController = require('../controllers/paymentController')
const { processPaymentSchema } = require('../validation/schemas')

const router = express.Router()

/**
 * POST /api/payments/bills/:orderId
 * Generate a bill for an order
 */
router.post('/bills/:orderId', authenticate, authorize('waiter', 'manager'), paymentController.generateBill)

/**
 * GET /api/payments/bills/:billId
 * Get bill details
 */
router.get('/bills/:billId', authenticate, paymentController.getBillById)

/**
 * POST /api/payments/bills/:billId/pay
 * Process payment for a bill
 */
router.post('/bills/:billId/pay', authenticate, validateBody(processPaymentSchema), paymentController.processBill)

/**
 * GET /api/payments/bills
 * Get bills by status (pending, paid, cancelled)
 */
router.get('/bills', authenticate, authorize('manager'), paymentController.getBillsByStatus)

/**
 * DELETE /api/payments/bills/:billId
 * Cancel/void a bill
 */
router.delete('/bills/:billId', authenticate, authorize('manager'), paymentController.cancelBill)

/**
 * PATCH /api/payments/bills/:billId/discount
 * Apply discount to a bill
 */
router.patch('/bills/:billId/discount', authenticate, authorize('manager'), validateBody({}), paymentController.applyDiscount)

module.exports = router
