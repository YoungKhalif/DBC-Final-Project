const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  restaurantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  openingTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  closingTime: {
    type: DataTypes.TIME,
    allowNull: true
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
  tableName: 'branches',
  timestamps: true
})

module.exports = Branch
