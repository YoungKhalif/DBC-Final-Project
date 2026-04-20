const { Bill, Order } = require('../models')

class PaymentService {
  async generateBill(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [{ model: require('../models').OrderItem }]
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Calculate amounts
    const subtotal = parseFloat(order.totalAmount)
    const taxRate = 0.1 // 10% tax
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const bill = await Bill.create({
      orderId,
      subtotal,
      taxAmount,
      totalAmount,
      status: 'pending'
    })

    return bill
  }

  async getBillById(id) {
    const bill = await Bill.findByPk(id, {
      include: [{ model: Order }]
    })

    if (!bill) {
      throw new Error('Bill not found')
    }

    return bill
  }

  async processBill(billId, paymentMethod) {
    const bill = await Bill.findByPk(billId)
    if (!bill) {
      throw new Error('Bill not found')
    }

    const validMethods = ['cash', 'card', 'check', 'transfer']
    if (!validMethods.includes(paymentMethod)) {
      throw new Error(`Invalid payment method: ${paymentMethod}`)
    }

    // Process payment (mock implementation)
    const paymentSuccessful = await this.processPayment(
      bill.totalAmount,
      paymentMethod
    )

    if (!paymentSuccessful) {
      throw new Error('Payment processing failed')
    }

    await bill.update({
      status: 'paid',
      paymentMethod,
      paidAt: new Date()
    })

    return bill
  }

  async processPayment(amount, method) {
    // Mock payment processing
    // In production, integrate with payment providers (Stripe, PayPal, etc.)
    console.log(`Processing ${method} payment for $${amount}`)

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Mock success rate
    return Math.random() > 0.05 // 95% success rate
  }

  async getBillsByStatus(status) {
    const bills = await Bill.findAll({
      where: { status },
      include: [{ model: Order }],
      order: [['createdAt', 'DESC']]
    })

    return bills
  }

  async cancelBill(billId) {
    const bill = await Bill.findByPk(billId)
    if (!bill) {
      throw new Error('Bill not found')
    }

    if (bill.status === 'paid') {
      throw new Error('Cannot cancel a paid bill')
    }

    await bill.update({ status: 'cancelled' })
    return bill
  }

  async applyDiscount(billId, discountAmount) {
    const bill = await Bill.findByPk(billId)
    if (!bill) {
      throw new Error('Bill not found')
    }

    if (discountAmount > bill.subtotal) {
      throw new Error('Discount cannot exceed subtotal')
    }

    const newTotalAmount = bill.subtotal - discountAmount + bill.taxAmount

    await bill.update({
      discountAmount,
      totalAmount: newTotalAmount
    })

    return bill
  }
}

module.exports = new PaymentService()
