const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { v4: uuidv4 } = require('uuid')

const Account = sequelize.define(
  'Account',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Incremented on logout/password change to invalidate all refresh tokens',
    },
  },
  {
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Account

    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
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
  tableName: 'accounts',
  timestamps: true
})

module.exports = Account

