const { Notification, Account } = require('../models')
const { Op } = require('sequelize')

// Observer pattern implementation for notifications
class NotificationService {
  constructor() {
    this.subscribers = []
  }

  subscribe(callback) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  async notifyUser(userId, notification) {
    // Save to database
    const savedNotification = await Notification.create({
      recipientId: userId,
      ...notification
    })

    // Notify all subscribers (for Socket.IO integration)
    this.subscribers.forEach(callback => {
      callback({
        userId,
        notification: savedNotification
      })
    })

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
