const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const reservationController = require('../controllers/reservationController')
const { createReservationSchema, updateReservationStatusSchema } = require('../validation/schemas')

const router = express.Router()

/**
 * POST /api/reservations
 * Create a new reservation
 */
router.post('/', validateBody(createReservationSchema), reservationController.createReservation)

/**
 * GET /api/reservations/:reservationId
 * Get a specific reservation
 */
router.get('/:reservationId', authenticate, reservationController.getReservationById)

/**
 * GET /api/reservations
 * Get all reservations for the user's branch (with optional filters)
 */
router.get('/', authenticate, reservationController.getReservationsByBranch)

/**
 * PATCH /api/reservations/:reservationId
 * Update reservation details
 */
router.patch('/:reservationId', authenticate, authorize('receptionist', 'manager'), validateBody(createReservationSchema), reservationController.updateReservation)

/**
 * PATCH /api/reservations/:reservationId/status
 * Update reservation status (pending → confirmed → checked-in → completed)
 */
router.patch('/:reservationId/status', authenticate, authorize('receptionist', 'manager'), validateBody(updateReservationStatusSchema), reservationController.updateReservationStatus)

/**
 * PATCH /api/reservations/:reservationId/assign-table
 * Assign a table to a reservation (receptionist or manager)
 */
router.patch('/:reservationId/assign-table', authenticate, authorize('receptionist', 'manager'), validateBody({}), reservationController.assignTableToReservation)

/**
 * POST /api/reservations/:reservationId/cancel
 * Cancel a reservation
 */
router.post('/:reservationId/cancel', authenticate, authorize('receptionist', 'manager'), reservationController.cancelReservation)

/**
 * GET /api/reservations/upcoming
 * Get upcoming reservations for the next N hours
 */
router.get('/upcoming', authenticate, reservationController.getUpcomingReservations)

module.exports = router

module.exports = router
