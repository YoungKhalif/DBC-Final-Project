const menuService = require('../services/menuService')
const { success } = require('../utils/responses')

// Menu operations
const getMenusByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const menus = await menuService.getMenusByBranch(branchId)
    res.json(success(menus, 'Menus retrieved'))
  } catch (error) {
    next(error)
  }
}

const getMenuById = async (req, res, next) => {
  try {
    const menu = await menuService.getMenuById(req.params.menuId)
    res.json(success(menu, 'Menu details'))
  } catch (error) {
    next(error)
  }
}

const createMenu = async (req, res, next) => {
  try {
    const { branchId } = req.user
    const menu = await menuService.createMenu(branchId, req.validatedBody)
    res.status(201).json(success(menu, 'Menu created', 201))
  } catch (error) {
    next(error)
  }
}

const updateMenu = async (req, res, next) => {
  try {
    const menu = await menuService.updateMenu(req.params.menuId, req.validatedBody)
    res.json(success(menu, 'Menu updated'))
  } catch (error) {
    next(error)
  }
}

const deleteMenu = async (req, res, next) => {
  try {
    const result = await menuService.deleteMenu(req.params.menuId)
    res.json(success(result, 'Menu deleted'))
  } catch (error) {
    next(error)
  }
}

// MenuSection operations
const createMenuSection = async (req, res, next) => {
  try {
    const section = await menuService.createMenuSection(req.params.menuId, req.validatedBody)
    res.status(201).json(success(section, 'Menu section created', 201))
  } catch (error) {
    next(error)
  }
}

const updateMenuSection = async (req, res, next) => {
  try {
    const section = await menuService.updateMenuSection(req.params.sectionId, req.validatedBody)
    res.json(success(section, 'Menu section updated'))
  } catch (error) {
    next(error)
  }
}

const deleteMenuSection = async (req, res, next) => {
  try {
    const result = await menuService.deleteMenuSection(req.params.sectionId)
    res.json(success(result, 'Menu section deleted'))
  } catch (error) {
    next(error)
  }
}

// MenuItem operations
const createMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.createMenuItem(req.params.sectionId, req.validatedBody)
    res.status(201).json(success(item, 'Menu item created', 201))
  } catch (error) {
    next(error)
  }
}

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.updateMenuItem(req.params.itemId, req.validatedBody)
    res.json(success(item, 'Menu item updated'))
  } catch (error) {
    next(error)
  }
}

const deleteMenuItem = async (req, res, next) => {
  try {
    const result = await menuService.deleteMenuItem(req.params.itemId)
    res.json(success(result, 'Menu item deleted'))
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getMenusByBranch,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
}
