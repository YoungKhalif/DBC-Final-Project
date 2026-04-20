const { DataTypes } = require('sequelize')
const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize) => {
  // ============ IDENTITY & ACCESS ============
  
  const Account = sequelize.define('Account', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: DataTypes.STRING,
    account_type: { type: DataTypes.ENUM('staff', 'guest'), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: DataTypes.DATE,
  }, {
    tableName: 'accounts',
    timestamps: true,
    indexes: [{ fields: ['email'], unique: true }, { fields: ['account_type'] }]
  })

  const Staff = sequelize.define('Staff', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    account_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.ENUM('receptionist', 'waiter', 'manager', 'chef'), allowNull: false },
    hireDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    salary: DataTypes.DECIMAL(12, 2),
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'staff',
    timestamps: true,
    indexes: [{ fields: ['account_id'] }, { fields: ['branch_id'] }, { fields: ['branch_id', 'role'] }]
  })

  // ============ ORGANIZATION ============

  const Restaurant = sequelize.define('Restaurant', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    phone: DataTypes.STRING,
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    address: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'restaurants',
    timestamps: true,
    indexes: [{ fields: ['name'] }]
  })

  const Branch = sequelize.define('Branch', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    restaurant_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    timezone: { type: DataTypes.STRING, defaultValue: 'UTC' },
    openingTime: { type: DataTypes.TIME, defaultValue: '09:00:00' },
    closingTime: { type: DataTypes.TIME, defaultValue: '22:00:00' },
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'branches',
    timestamps: true,
    indexes: [{ fields: ['restaurant_id'] }, { fields: ['name'] }]
  })

  // ============ VENUE ============

  const TableLayout = sequelize.define('TableLayout', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    gridRows: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    gridCols: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    name: { type: DataTypes.STRING, defaultValue: 'Main Dining Area' },
  }, {
    tableName: 'table_layouts',
    timestamps: true,
    indexes: [{ fields: ['branch_id'] }]
  })

  const Table = sequelize.define('Table', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    layout_id: { type: DataTypes.UUID, allowNull: false },
    tableNumber: { type: DataTypes.INTEGER, allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    status: { type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning'), defaultValue: 'available' },
    gridRow: DataTypes.INTEGER,
    gridCol: DataTypes.INTEGER,
    location: DataTypes.STRING,
    notes: DataTypes.TEXT,
  }, {
    tableName: 'tables',
    timestamps: true,
    indexes: [{ fields: ['layout_id'] }, { fields: ['layout_id', 'status'] }]
  })

  const TableSeat = sequelize.define('TableSeat', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    table_id: { type: DataTypes.UUID, allowNull: false },
    seat_number: { type: DataTypes.INTEGER, allowNull: false },
    guest_account_id: DataTypes.UUID,
    isOccupied: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'table_seats',
    timestamps: true,
    indexes: [{ fields: ['table_id'] }, { fields: ['table_id', 'seat_number'], unique: true }]
  })

  // ============ MENU ============

  const Menu = sequelize.define('Menu', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'menus',
    timestamps: true,
    indexes: [{ fields: ['branch_id'] }]
  })

  const MenuSection = sequelize.define('MenuSection', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    menu_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'menu_sections',
    timestamps: true,
    indexes: [{ fields: ['menu_id'] }]
  })

  const MenuItem = sequelize.define('MenuItem', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    menu_section_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    dietary_flags: { type: DataTypes.JSONB, defaultValue: {} },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'menu_items',
    timestamps: true,
    indexes: [{ fields: ['menu_section_id'] }]
  })

  // ============ OPERATIONS ============

  const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    branch_id: { type: DataTypes.UUID, allowNull: false },
    table_id: DataTypes.UUID,
    account_id: { type: DataTypes.UUID, allowNull: false },
    guestName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    phone: DataTypes.STRING,
    party_size: { type: DataTypes.INTEGER, allowNull: false },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'cancelled', 'no_show'), defaultValue: 'pending' },
    notes: DataTypes.TEXT,
  }, {
    tableName: 'reservations',
    timestamps: true,
    indexes: [
      { fields: ['branch_id'] },
      { fields: ['account_id'] },
      { fields: ['scheduled_at', 'branch_id', 'status'] }
    ]
  })

  const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    table_id: { type: DataTypes.UUID, allowNull: false },
    waiter_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'submitted', 'in_kitchen', 'ready', 'served', 'closed'), defaultValue: 'draft' },
    placed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    notes: DataTypes.TEXT,
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [{ fields: ['table_id'] }, { fields: ['table_id', 'placed_at'], order: [['placed_at', 'DESC']] }]
  })

  const Meal = sequelize.define('Meal', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    order_id: { type: DataTypes.UUID, allowNull: false },
    course_number: { type: DataTypes.INTEGER, defaultValue: 1 },
    notes: DataTypes.TEXT,
  }, {
    tableName: 'meals',
    timestamps: true,
    indexes: [{ fields: ['order_id'] }]
  })

  const MealItem = sequelize.define('MealItem', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    meal_id: { type: DataTypes.UUID, allowNull: false },
    menu_item_id: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    special_instructions: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served'), defaultValue: 'pending' },
  }, {
    tableName: 'meal_items',
    timestamps: true,
    indexes: [{ fields: ['meal_id'] }]
  })

  // ============ BILLING ============

  const Bill = sequelize.define('Bill', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    order_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    status: { type: DataTypes.ENUM('open', 'paid', 'voided'), defaultValue: 'open' },
    paid_at: DataTypes.DATE,
  }, {
    tableName: 'bills',
    timestamps: true,
    indexes: [{ fields: ['order_id'] }]
  })

  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    bill_id: { type: DataTypes.UUID, allowNull: false },
    method: { type: DataTypes.ENUM('cash', 'card', 'mobile', 'comp'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
    provider_reference: DataTypes.STRING,
    notes: DataTypes.TEXT,
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [{ fields: ['bill_id'] }]
  })

  // ============ NOTIFICATIONS ============

  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4() },
    recipient_account_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('order_update', 'reservation_reminder', 'table_ready', 'payment_received', 'system'), allowNull: false },
    payload: { type: DataTypes.JSONB, defaultValue: {} },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    read_at: DataTypes.DATE,
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['recipient_account_id'] },
      { fields: ['recipient_account_id', 'is_read'] }
    ]
  })

  // ============ ASSOCIATIONS ============

  // Account relationships
  Account.hasOne(Staff, { foreignKey: 'account_id', onDelete: 'CASCADE' })
  Staff.belongsTo(Account, { foreignKey: 'account_id' })

  Account.hasMany(Reservation, { foreignKey: 'account_id' })
  Reservation.belongsTo(Account, { foreignKey: 'account_id' })

  Account.hasMany(Notification, { foreignKey: 'recipient_account_id' })
  Notification.belongsTo(Account, { foreignKey: 'recipient_account_id' })

  TableSeat.belongsTo(Account, { foreignKey: 'guest_account_id', as: 'Guest' })

  // Restaurant relationships
  Restaurant.hasMany(Branch, { foreignKey: 'restaurant_id', onDelete: 'CASCADE' })
  Branch.belongsTo(Restaurant, { foreignKey: 'restaurant_id' })

  // Branch relationships
  Branch.hasMany(Staff, { foreignKey: 'branch_id' })
  Staff.belongsTo(Branch, { foreignKey: 'branch_id' })

  Branch.hasMany(TableLayout, { foreignKey: 'branch_id', onDelete: 'CASCADE' })
  TableLayout.belongsTo(Branch, { foreignKey: 'branch_id' })

  Branch.hasMany(Menu, { foreignKey: 'branch_id' })
  Menu.belongsTo(Branch, { foreignKey: 'branch_id' })

  Branch.hasMany(Reservation, { foreignKey: 'branch_id' })
  Reservation.belongsTo(Branch, { foreignKey: 'branch_id' })

  // Table relationships
  TableLayout.hasMany(Table, { foreignKey: 'layout_id', onDelete: 'CASCADE' })
  Table.belongsTo(TableLayout, { foreignKey: 'layout_id' })

  Table.hasMany(TableSeat, { foreignKey: 'table_id', onDelete: 'CASCADE' })
  TableSeat.belongsTo(Table, { foreignKey: 'table_id' })

  Table.hasMany(Order, { foreignKey: 'table_id' })
  Order.belongsTo(Table, { foreignKey: 'table_id' })

  Table.hasMany(Reservation, { foreignKey: 'table_id' })
  Reservation.belongsTo(Table, { foreignKey: 'table_id' })

  // Menu relationships
  Menu.hasMany(MenuSection, { foreignKey: 'menu_id', onDelete: 'CASCADE' })
  MenuSection.belongsTo(Menu, { foreignKey: 'menu_id' })

  MenuSection.hasMany(MenuItem, { foreignKey: 'menu_section_id', onDelete: 'CASCADE' })
  MenuItem.belongsTo(MenuSection, { foreignKey: 'menu_section_id' })

  // Order relationships
  Order.belongsTo(Account, { foreignKey: 'waiter_id', as: 'Waiter' })

  Order.hasMany(Meal, { foreignKey: 'order_id', onDelete: 'CASCADE' })
  Meal.belongsTo(Order, { foreignKey: 'order_id' })

  Order.hasOne(Bill, { foreignKey: 'order_id' })
  Bill.belongsTo(Order, { foreignKey: 'order_id' })

  // Meal relationships
  Meal.hasMany(MealItem, { foreignKey: 'meal_id', onDelete: 'CASCADE' })
  MealItem.belongsTo(Meal, { foreignKey: 'meal_id' })

  MealItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id' })
  MenuItem.hasMany(MealItem, { foreignKey: 'menu_item_id' })

  // Bill relationships
  Bill.hasMany(Payment, { foreignKey: 'bill_id', onDelete: 'CASCADE' })
  Payment.belongsTo(Bill, { foreignKey: 'bill_id' })

  // ============ EXPORTS ============

  return {
    Account,
    Staff,
    Restaurant,
    Branch,
    TableLayout,
    Table,
    TableSeat,
    Menu,
    MenuSection,
    MenuItem,
    Reservation,
    Order,
    Meal,
    MealItem,
    Bill,
    Payment,
    Notification,
  }
}
