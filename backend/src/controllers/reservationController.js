const reservationService = require('../services/reservationService')
const { success } = require('../utils/responses')

const createReservation = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const data = { ...req.validatedBody, branchId }
    const reservation = await reservationService.createReservation(data)
    res.status(201).json(success(reservation, 'Reservation created', 201))
  } catch (error) {
    next(error)
  }
}

const getReservationById = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.reservationId)
    res.json(success(reservation, 'Reservation details'))
  } catch (error) {
    next(error)
  }
}

const getReservationsByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const options = {}
    
    if (req.query.status) {
      options.status = req.query.status
    }
    
    if (req.query.startDate && req.query.endDate) {
      options.dateRange = {
        start: req.query.startDate,
        end: req.query.endDate
      }
    }
    
    const reservations = await reservationService.getReservationsByBranch(branchId, options)
    res.json(success(reservations, 'Reservations retrieved'))
  } catch (error) {
    next(error)
  }
}

const updateReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.reservationId, req.validatedBody)
    res.json(success(reservation, 'Reservation updated'))
  } catch (error) {
    next(error)
  }
}

const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedBody
    const reservation = await reservationService.updateReservationStatus(req.params.reservationId, status)
    res.json(success(reservation, 'Reservation status updated'))
  } catch (error) {
    next(error)
  }
}

const assignTableToReservation = async (req, res, next) => {
  try {
    const { tableId } = req.validatedBody
    const reservation = await reservationService.assignTableToReservation(req.params.reservationId, tableId)
    res.json(success(reservation, 'Table assigned to reservation'))
  } catch (error) {
    next(error)
  }
}

const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.cancelReservation(req.params.reservationId)
    res.json(success(reservation, 'Reservation cancelled'))
  } catch (error) {
    next(error)
  }
}

const getUpcomingReservations = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const hoursAhead = req.query.hoursAhead ? parseInt(req.query.hoursAhead) : 2
    const reservations = await reservationService.getUpcomingReservations(branchId, hoursAhead)
    res.json(success(reservations, 'Upcoming reservations'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createReservation,
  getReservationById,
  getReservationsByBranch,
  updateReservation,
  updateReservationStatus,
  assignTableToReservation,
  cancelReservation,
  getUpcomingReservations,
}
