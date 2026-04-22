const express = require('express')
const { authenticate, authorize, requireBranch } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const tableController = require('../controllers/tableController')
const { createTableSchema, updateTableStatusSchema } = require('../validation/schemas')

const router = express.Router()

/**
 * GET /api/tables
 * Get all tables in the user's branch
 */
router.get('/', authenticate, tableController.getAllTables)

/**
 * GET /api/tables/:tableId
 * Get a specific table with active orders
 */
router.get('/:tableId', authenticate, tableController.getTableById)

/**
 * POST /api/tables
 * Create a new table in the branch (manager only)
 */
router.post('/', authenticate, authorize('manager'), validateBody(createTableSchema), tableController.createTable)

/**
 * PATCH /api/tables/:tableId
 * Update table details
 */
router.patch('/:tableId', authenticate, authorize('manager'), validateBody(createTableSchema), tableController.updateTable)

/**
 * PATCH /api/tables/:tableId/status
 * Update table status (occupied, available, reserved, closed)
 */
router.patch('/:tableId/status', authenticate, validateBody(updateTableStatusSchema), tableController.updateTableStatus)

/**
 * DELETE /api/tables/:tableId
 * Delete a table (manager only)
 */
router.delete('/:tableId', authenticate, authorize('manager'), tableController.deleteTable)

module.exports = router
