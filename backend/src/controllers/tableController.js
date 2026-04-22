const tableService = require('../services/tableService')
const { success } = require('../utils/responses')

const getAllTables = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const tables = await tableService.getAllTables(branchId)
    res.json(success(tables, 'Tables retrieved'))
  } catch (error) {
    next(error)
  }
}

const getTableById = async (req, res, next) => {
  try {
    const table = await tableService.getTableById(req.params.tableId)
    res.json(success(table, 'Table details'))
  } catch (error) {
    next(error)
  }
}

const createTable = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const table = await tableService.createTable(branchId, req.validatedBody)
    res.status(201).json(success(table, 'Table created', 201))
  } catch (error) {
    next(error)
  }
}

const updateTable = async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.tableId, req.validatedBody)
    res.json(success(table, 'Table updated'))
  } catch (error) {
    next(error)
  }
}

const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedBody
    const table = await tableService.updateTableStatus(req.params.tableId, status)
    res.json(success(table, 'Table status updated'))
  } catch (error) {
    next(error)
  }
}

const deleteTable = async (req, res, next) => {
  try {
    const result = await tableService.deleteTable(req.params.tableId)
    res.json(success(result, 'Table deleted'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
}
