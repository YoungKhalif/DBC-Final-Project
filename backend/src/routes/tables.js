const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const tableService = require('../services/tableService')

// Get all tables in a branch
router.get('/branch/:branchId', authenticate, async (req, res) => {
  try {
    const tables = await tableService.getAllTables(req.params.branchId)
    res.json(tables)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get table by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const table = await tableService.getTableById(req.params.id)
    res.json(table)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Create table
router.post('/', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { branchId, tableNumber, capacity, location, notes } = req.body
    const table = await tableService.createTable(branchId, {
      tableNumber,
      capacity,
      location,
      notes
    })
    res.status(201).json(table)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update table
router.put('/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body)
    res.json(table)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update table status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    const table = await tableService.updateTableStatus(req.params.id, status)
    res.json(table)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete table
router.delete('/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    await tableService.deleteTable(req.params.id)
    res.json({ message: 'Table deleted successfully' })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

module.exports = router
