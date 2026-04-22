const EventEmitter = require('events')

/**
 * EventBus - Singleton for domain events
 * Services emit events, subscribers (like NotificationService) listen
 */
class EventBus extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(20)
  }

  // Domain events with typed payloads
  emitOrderStatusChanged(orderId, from, to, tableId, waiterId) {
    this.emit('order:status_changed', {
      type: 'order:status_changed',
      orderId,
      from,
      to,
      tableId,
      waiterId,
      timestamp: new Date(),
    })
  }

  emitMealItemStatusChanged(mealItemId, orderId, from, to) {
    this.emit('meal_item:status_changed', {
      type: 'meal_item:status_changed',
      mealItemId,
      orderId,
      from,
      to,
      timestamp: new Date(),
    })
  }

  emitTableStatusChanged(tableId, branchId, from, to) {
    this.emit('table:status_changed', {
      type: 'table:status_changed',
      tableId,
      branchId,
      from,
      to,
      timestamp: new Date(),
    })
  }

  emitReservationUpdated(reservationId, branchId, status, guestId = null) {
    this.emit('reservation:updated', {
      type: 'reservation:updated',
      reservationId,
      branchId,
      status,
      guestId,
      timestamp: new Date(),
    })
  }

  emitPaymentReceived(billId, orderId, amount, method) {
    this.emit('payment:received', {
      type: 'payment:received',
      billId,
      orderId,
      amount,
      method,
      timestamp: new Date(),
    })
  }

  emitMenuUpdated(menuId, branchId) {
    this.emit('menu:updated', {
      type: 'menu:updated',
      menuId,
      branchId,
      timestamp: new Date(),
    })
  }
}

// Singleton instance
const eventBus = new EventBus()

module.exports = eventBus
