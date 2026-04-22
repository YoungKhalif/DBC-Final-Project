const { Notification } = require('../models')

/**
 * NotificationService - Observer pattern implementation
 * Subscribes to domain events and broadcasts to users via WebSocket
 */
class NotificationService {
  constructor(wsGateway, eventBus) {
    this.wsGateway = wsGateway
    this.eventBus = eventBus

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Order status changed
    this.eventBus.on('order:status_changed', (event) => this.handleOrderStatusChanged(event))

    // Meal item status changed
    this.eventBus.on('meal_item:status_changed', (event) =>
      this.handleMealItemStatusChanged(event)
    )

    // Table status changed
    this.eventBus.on('table:status_changed', (event) => this.handleTableStatusChanged(event))

    // Reservation updated
    this.eventBus.on('reservation:updated', (event) => this.handleReservationUpdated(event))

    // Payment received
    this.eventBus.on('payment:received', (event) => this.handlePaymentReceived(event))

    // Menu updated
    this.eventBus.on('menu:updated', (event) => this.handleMenuUpdated(event))
  }

  async handleOrderStatusChanged(event) {
    const { orderId, from, to, tableId, waiterId } = event

    // Notify waiter
    const notif = await this.createNotification(waiterId, 'order_status_changed', {
      orderId,
      from,
      to,
      tableId,
    })

    this.wsGateway.emitToUser(waiterId, 'order:status_changed', {
      orderId,
      status: to,
      tableId,
      timestamp: new Date(),
    })
  }

  async handleMealItemStatusChanged(event) {
    const { mealItemId, orderId, from, to } = event

    // Notify kitchen staff (via order's branch)
    const notif = await this.createNotification(null, 'meal_item_status_changed', {
      mealItemId,
      orderId,
      from,
      to,
    })

    // Broadcast to branch kitchen display
    // (branch ID would come from order details in a full implementation)
    this.wsGateway.emitToBranch(null, 'meal_item:status_changed', {
      mealItemId,
      status: to,
      timestamp: new Date(),
    })
  }

  async handleTableStatusChanged(event) {
    const { tableId, branchId, from, to } = event

    // Notify all staff in branch
    const notif = await this.createNotification(null, 'table_status_changed', {
      tableId,
      branchId,
      from,
      to,
    })

    this.wsGateway.emitToBranch(branchId, 'table:status_changed', {
      tableId,
      status: to,
      timestamp: new Date(),
    })
  }

  async handleReservationUpdated(event) {
    const { reservationId, branchId, status, guestId } = event

    // Notify guest if registered
    if (guestId) {
      const notif = await this.createNotification(guestId, 'reservation_updated', {
        reservationId,
        status,
      })

      this.wsGateway.emitToUser(guestId, 'reservation:updated', {
        reservationId,
        status,
        timestamp: new Date(),
      })
    }

    // Notify reception staff
    this.wsGateway.emitToBranch(branchId, 'reservation:updated', {
      reservationId,
      status,
      timestamp: new Date(),
    })
  }

  async handlePaymentReceived(event) {
    const { billId, orderId, amount, method } = event

    // Notify all staff in branch
    const notif = await this.createNotification(null, 'payment_received', {
      billId,
      orderId,
      amount,
      method,
    })

    // (branch ID would come from order details)
    // this.wsGateway.emitToBranch(branchId, 'payment:received', {...})
  }

  async handleMenuUpdated(event) {
    const { menuId, branchId } = event

    // Notify all staff in branch
    this.wsGateway.emitToBranch(branchId, 'menu:updated', {
      menuId,
      timestamp: new Date(),
    })
  }

  /**
   * Create notification record
   */
  async createNotification(recipientAccountId, type, payload) {
    if (!recipientAccountId) {
      return null
    }

    try {
      return await Notification.create({
        recipient_account_id: recipientAccountId,
        type,
        payload,
        is_read: false,
      })
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error)
      return null
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(accountId, { unread = false, limit = 20, offset = 0 } = {}) {
    const where = { recipient_account_id: accountId }
    if (unread) {
      where.is_read = false
    }

    return Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    })
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { id: notificationId }, returning: true }
    )
  }

  /**
   * Mark all as read for user
   */
  async markAllAsRead(accountId) {
    return Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { recipient_account_id: accountId, is_read: false } }
    )
  }

  /**
   * Get unread count
   */
  async getUnreadCount(accountId) {
    return Notification.count({
      where: { recipient_account_id: accountId, is_read: false },
    })
  }
}

module.exports = NotificationService


    return savedNotification
  }

  async notifyRole(role, notification, branchId = null) {
    // Find all users with this role
    const where = { role }
    const users = await Account.findAll({ where })

    const notifications = []
    for (const user of users) {
      const saved = await this.notifyUser(user.id, notification)
      notifications.push(saved)
    }

    return notifications
  }

  async getUserNotifications(userId, unreadOnly = false) {
    const where = { recipientId: userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    return notifications
  }

  async markAsRead(notificationId) {
    const notification = await Notification.findByPk(notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    await notification.update({
      isRead: true,
      readAt: new Date()
    })

    return notification
  }

  async markAllAsRead(userId) {
    await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          recipientId: userId,
          isRead: false
        }
      }
    )
  }

  async deleteNotification(notificationId) {
    const notification = await Notification.findByPk(notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    await notification.destroy()
    return { message: 'Notification deleted' }
  }
}

module.exports = new NotificationService()
