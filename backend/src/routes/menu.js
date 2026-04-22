const express = require('express')
const { authenticate, authorize } = require('../middleware/auth')
const validateBody = require('../middleware/validateBody')
const menuController = require('../controllers/menuController')
const { } = require('../validation/schemas')

const router = express.Router()

// Menu operations
/**
 * GET /api/menus
 * Get all menus in the user's branch
 */
router.get('/', authenticate, menuController.getMenusByBranch)

/**
 * GET /api/menus/:menuId
 * Get menu with all sections and items
 */
router.get('/:menuId', authenticate, menuController.getMenuById)

/**
 * POST /api/menus
 * Create a new menu (manager only)
 */
router.post('/', authenticate, authorize('manager'), validateBody({}), menuController.createMenu)

/**
 * PATCH /api/menus/:menuId
 * Update menu details
 */
router.patch('/:menuId', authenticate, authorize('manager'), validateBody({}), menuController.updateMenu)

/**
 * DELETE /api/menus/:menuId
 * Delete a menu
 */
router.delete('/:menuId', authenticate, authorize('manager'), menuController.deleteMenu)

// MenuSection operations
/**
 * POST /api/menus/:menuId/sections
 * Create menu section
 */
router.post('/:menuId/sections', authenticate, authorize('manager'), validateBody({}), menuController.createMenuSection)

/**
 * PATCH /api/menus/sections/:sectionId
 * Update menu section
 */
router.patch('/sections/:sectionId', authenticate, authorize('manager'), validateBody({}), menuController.updateMenuSection)

/**
 * DELETE /api/menus/sections/:sectionId
 * Delete menu section
 */
router.delete('/sections/:sectionId', authenticate, authorize('manager'), menuController.deleteMenuSection)

// MenuItem operations
/**
 * POST /api/menus/sections/:sectionId/items
 * Create menu item
 */
router.post('/sections/:sectionId/items', authenticate, authorize('manager'), validateBody({}), menuController.createMenuItem)

/**
 * PATCH /api/menus/items/:itemId
 * Update menu item
 */
router.patch('/items/:itemId', authenticate, authorize('manager'), validateBody({}), menuController.updateMenuItem)

/**
 * DELETE /api/menus/items/:itemId
 * Delete menu item
 */
router.delete('/items/:itemId', authenticate, authorize('manager'), menuController.deleteMenuItem)

module.exports = router
