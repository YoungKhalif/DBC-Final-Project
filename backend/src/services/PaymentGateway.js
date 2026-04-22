const { v4: uuidv4 } = require('uuid')

/**
 * PaymentGateway Interface
 * Abstract payment processing - swap implementations without changing service code
 */
class PaymentGateway {
  async process(billId, amount, method) {
    throw new Error('process() must be implemented')
  }

  async refund(paymentId) {
    throw new Error('refund() must be implemented')
  }
}

/**
 * Stub implementation - always succeeds
 * Replace with real payment provider (Stripe, PayPal, etc.)
 */
class StubPaymentGateway extends PaymentGateway {
  async process(billId, amount, method) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      success: true,
      reference: uuidv4(),
      provider: 'stub',
      amount,
      method,
      timestamp: new Date(),
    }
  }

  async refund(paymentId) {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      success: true,
      reference: uuidv4(),
      provider: 'stub',
      paymentId,
      timestamp: new Date(),
    }
  }
}

module.exports = {
  PaymentGateway,
  StubPaymentGateway,
}
