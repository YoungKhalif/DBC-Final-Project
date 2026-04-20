const { DataTypes } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize) => {
  const TableLayout = sequelize.define(
    'TableLayout',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      branch_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      gridRows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      gridCols: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: 'Main Dining Area',
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      tableName: 'table_layouts',
      timestamps: true,
      indexes: [{ fields: ['branch_id'] }],
    }
  )

  return TableLayout
}
