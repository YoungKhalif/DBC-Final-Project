const { DataTypes } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize) => {
  const TableSeat = sequelize.define(
    'TableSeat',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      table_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tables',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      seat_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      guest_account_id: {
        type: DataTypes.UUID,
        references: {
          model: 'accounts',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      isOccupied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: 'table_seats',
      timestamps: true,
      indexes: [
        { fields: ['table_id'] },
        { fields: ['guest_account_id'] },
        { fields: ['table_id', 'seat_number'], unique: true },
      ],
    }
  )

  return TableSeat
}
