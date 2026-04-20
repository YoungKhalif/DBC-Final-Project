const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  menuSectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menu_sections',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  prepTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Preparation time in minutes'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ingredients: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  allergens: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'menu_items',
  timestamps: true
})

module.exports = MenuItem
