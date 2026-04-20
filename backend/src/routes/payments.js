const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const paymentService = require('../services/paymentService')

// Generate bill
router.post('/bills', authenticate, authorize(['waiter', 'manager']), async (req, res) => {
  try {
    const { orderId } = req.body
    const bill = await paymentService.generateBill(orderId)
    res.status(201).json(bill)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get bill by ID
router.get('/bills/:id', authenticate, async (req, res) => {
  try {
    const bill = await paymentService.getBillById(req.params.id)
    res.json(bill)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Get bills by status
router.get('/bills/status/:status', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const bills = await paymentService.getBillsByStatus(req.params.status)
    res.json(bills)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Process payment
router.post('/bills/:id/pay', authenticate, async (req, res) => {
  try {
    const { paymentMethod } = req.body
    const bill = await paymentService.processBill(req.params.id, paymentMethod)
    res.json(bill)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Apply discount
router.post('/bills/:id/discount', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { discountAmount } = req.body
    const bill = await paymentService.applyDiscount(req.params.id, discountAmount)
    res.json(bill)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Cancel bill
router.delete('/bills/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const bill = await paymentService.cancelBill(req.params.id)
    res.json(bill)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
