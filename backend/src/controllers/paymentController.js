const paymentService = require('../services/paymentService')
const { success } = require('../utils/responses')

const generateBill = async (req, res, next) => {
  try {
    const bill = await paymentService.generateBill(req.params.orderId)
    res.status(201).json(success(bill, 'Bill generated', 201))
  } catch (error) {
    next(error)
  }
}

const getBillById = async (req, res, next) => {
  try {
    const bill = await paymentService.getBillById(req.params.billId)
    res.json(success(bill, 'Bill details'))
  } catch (error) {
    next(error)
  }
}

const processBill = async (req, res, next) => {
  try {
    const { paymentMethod } = req.validatedBody
    const bill = await paymentService.processBill(req.params.billId, paymentMethod)
    res.json(success(bill, 'Payment processed successfully'))
  } catch (error) {
    next(error)
  }
}

const getBillsByStatus = async (req, res, next) => {
  try {
    const { status } = req.query
    const bills = await paymentService.getBillsByStatus(status)
    res.json(success(bills, 'Bills retrieved'))
  } catch (error) {
    next(error)
  }
}

const cancelBill = async (req, res, next) => {
  try {
    const bill = await paymentService.cancelBill(req.params.billId)
    res.json(success(bill, 'Bill cancelled'))
  } catch (error) {
    next(error)
  }
}

const applyDiscount = async (req, res, next) => {
  try {
    const { discountAmount } = req.validatedBody
    const bill = await paymentService.applyDiscount(req.params.billId, discountAmount)
    res.json(success(bill, 'Discount applied'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  generateBill,
  getBillById,
  processBill,
  getBillsByStatus,
  cancelBill,
  applyDiscount,
}
