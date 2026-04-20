const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  guestName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  partySize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reservationDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tableId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tables',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'checked-in', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  specialRequests: {
    type: DataTypes.TEXT,
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
  tableName: 'reservations',
  timestamps: true
})

module.exports = Reservation
