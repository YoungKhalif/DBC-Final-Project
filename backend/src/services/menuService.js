const { Menu, MenuSection, MenuItem } = require('../models')

class MenuService {
  async getMenusByBranch(branchId) {
    const menus = await Menu.findAll({
      where: { branchId },
      include: [
        {
          model: MenuSection,
          include: [{ model: MenuItem }]
        }
      ]
    })
    return menus
  }

  async getMenuById(id) {
    const menu = await Menu.findByPk(id, {
      include: [
        {
          model: MenuSection,
          include: [{ model: MenuItem }]
        }
      ]
    })

    if (!menu) {
      throw new Error('Menu not found')
    }

    return menu
  }

  async createMenu(branchId, data) {
    const menu = await Menu.create({
      branchId,
      ...data
    })
    return menu
  }

  async updateMenu(id, data) {
    const menu = await Menu.findByPk(id)
    if (!menu) {
      throw new Error('Menu not found')
    }

    await menu.update(data)
    return menu
  }

  async deleteMenu(id) {
    const menu = await Menu.findByPk(id)
    if (!menu) {
      throw new Error('Menu not found')
    }

    await menu.destroy()
    return { message: 'Menu deleted' }
  }

  // MenuSection operations
  async createMenuSection(menuId, data) {
    const section = await MenuSection.create({
      menuId,
      ...data
    })
    return section
  }

  async updateMenuSection(id, data) {
    const section = await MenuSection.findByPk(id)
    if (!section) {
      throw new Error('MenuSection not found')
    }

    await section.update(data)
    return section
  }

  async deleteMenuSection(id) {
    const section = await MenuSection.findByPk(id)
    if (!section) {
      throw new Error('MenuSection not found')
    }

    await section.destroy()
    return { message: 'MenuSection deleted' }
  }

  // MenuItem operations
  async createMenuItem(menuSectionId, data) {
    const item = await MenuItem.create({
      menuSectionId,
      ...data
    })
    return item
  }

  async updateMenuItem(id, data) {
    const item = await MenuItem.findByPk(id)
    if (!item) {
      throw new Error('MenuItem not found')
    }

    await item.update(data)
    return item
  }

  async deleteMenuItem(id) {
    const item = await MenuItem.findByPk(id)
    if (!item) {
      throw new Error('MenuItem not found')
    }

    await item.destroy()
    return { message: 'MenuItem deleted' }
  }

  async getMenuItemById(id) {
    const item = await MenuItem.findByPk(id, {
      include: [
        {
          model: MenuSection,
          include: [{ model: Menu }]
        }
      ]
    })

    if (!item) {
      throw new Error('MenuItem not found')
    }

    return item
  }
}

module.exports = new MenuService()
