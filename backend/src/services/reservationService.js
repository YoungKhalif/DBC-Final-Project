const { Reservation, Table, Branch } = require('../models')
const { Op } = require('sequelize')

class ReservationService {
  async createReservation(data) {
    const reservation = await Reservation.create(data)
    return this.getReservationById(reservation.id)
  }

  async getReservationById(id) {
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Table },
        { model: Branch }
      ]
    })

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    return reservation
  }

  async getReservationsByBranch(branchId, options = {}) {
    const where = { branchId }

    if (options.status) {
      where.status = options.status
    }

    if (options.dateRange) {
      where.reservationDateTime = {
        [Op.between]: [
          new Date(options.dateRange.start),
          new Date(options.dateRange.end)
        ]
      }
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: Table },
        { model: Branch }
      ],
      order: [['reservationDateTime', 'ASC']]
    })

    return reservations
  }

  async updateReservation(id, data) {
    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    await reservation.update(data)
    return this.getReservationById(id)
  }

  async updateReservationStatus(id, status) {
    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked-in', 'cancelled'],
      'checked-in': ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    }

    if (!validTransitions[reservation.status]?.includes(status)) {
      throw new Error(`Cannot transition from ${reservation.status} to ${status}`)
    }

    await reservation.update({ status })
    return this.getReservationById(id)
  }

  async assignTableToReservation(reservationId, tableId) {
    const reservation = await Reservation.findByPk(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    const table = await Table.findByPk(tableId)
    if (!table) {
      throw new Error('Table not found')
    }

    if (table.capacity < reservation.partySize) {
      throw new Error('Table capacity is insufficient for party size')
    }

    await reservation.update({ tableId })
    return this.getReservationById(reservationId)
  }

  async cancelReservation(id) {
    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    await reservation.update({ status: 'cancelled' })
    return reservation
  }

  async getUpcomingReservations(branchId, hoursAhead = 2) {
    const now = new Date()
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

    const reservations = await Reservation.findAll({
      where: {
        branchId,
        status: { [Op.ne]: 'cancelled' },
        reservationDateTime: {
          [Op.between]: [now, futureTime]
        }
      },
      include: [{ model: Table }],
      order: [['reservationDateTime', 'ASC']]
    })

    return reservations
  }
}

module.exports = new ReservationService()
