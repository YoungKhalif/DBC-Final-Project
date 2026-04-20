const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth')
const menuService = require('../services/menuService')

// Get menus by branch
router.get('/branch/:branchId', async (req, res) => {
  try {
    const menus = await menuService.getMenusByBranch(req.params.branchId)
    res.json(menus)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get menu by ID
router.get('/:id', async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id)
    res.json(menu)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Create menu
router.post('/', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { branchId, name, description } = req.body
    const menu = await menuService.createMenu(branchId, { name, description })
    res.status(201).json(menu)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update menu
router.put('/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const menu = await menuService.updateMenu(req.params.id, req.body)
    res.json(menu)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete menu
router.delete('/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    await menuService.deleteMenu(req.params.id)
    res.json({ message: 'Menu deleted' })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Menu sections
router.post('/sections', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { menuId, name, description, displayOrder } = req.body
    const section = await menuService.createMenuSection(menuId, {
      name,
      description,
      displayOrder
    })
    res.status(201).json(section)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Menu items
router.post('/items', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { menuSectionId, name, description, price, prepTime, ingredients, allergens } = req.body
    const item = await menuService.createMenuItem(menuSectionId, {
      name,
      description,
      price,
      prepTime,
      ingredients,
      allergens
    })
    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get menu item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await menuService.getMenuItemById(req.params.id)
    res.json(item)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Update menu item
router.put('/items/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body)
    res.json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete menu item
router.delete('/items/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    await menuService.deleteMenuItem(req.params.id)
    res.json({ message: 'MenuItem deleted' })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

module.exports = router
