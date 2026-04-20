const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const reservationService = require('../services/reservationService')

// Create reservation
router.post('/', async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body)
    res.status(201).json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id)
    res.json(reservation)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Get reservations by branch
router.get('/branch/:branchId', authenticate, async (req, res) => {
  try {
    const { status, dateRange } = req.query
    const reservations = await reservationService.getReservationsByBranch(
      req.params.branchId,
      { status, dateRange: dateRange ? JSON.parse(dateRange) : undefined }
    )
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update reservation
router.put('/:id', authenticate, authorize(['receptionist', 'manager']), async (req, res) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body)
    res.json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update reservation status
router.patch('/:id/status', authenticate, authorize(['receptionist', 'manager']), async (req, res) => {
  try {
    const { status } = req.body
    const reservation = await reservationService.updateReservationStatus(req.params.id, status)
    res.json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Assign table to reservation
router.post('/:id/assign-table', authenticate, authorize(['receptionist', 'manager']), async (req, res) => {
  try {
    const { tableId } = req.body
    const reservation = await reservationService.assignTableToReservation(req.params.id, tableId)
    res.json(reservation)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Cancel reservation
router.delete('/:id', authenticate, authorize(['receptionist', 'manager']), async (req, res) => {
  try {
    await reservationService.cancelReservation(req.params.id)
    res.json({ message: 'Reservation cancelled' })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Get upcoming reservations
router.get('/branch/:branchId/upcoming', authenticate, async (req, res) => {
  try {
    const { hoursAhead } = req.query
    const reservations = await reservationService.getUpcomingReservations(
      req.params.branchId,
      hoursAhead ? parseInt(hoursAhead) : 2
    )
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
