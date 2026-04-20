#!/usr/bin/env node

/**
 * Database Seeder: Create sample data for testing
 */

const sequelize = require('../config/database')
const {
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
} = require('../models')
const { hashPassword } = require('../utils/passwordUtils')

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create restaurant
    const restaurant = await Restaurant.create({
      name: 'The Golden Fork',
      description: 'Fine dining establishment',
      phone: '555-1234',
      email: 'info@goldenfork.com',
      address: '123 Main St, Downtown',
    })
    console.log('✓ Created restaurant')

    // Create branch
    const branch = await Branch.create({
      restaurant_id: restaurant.id,
      name: 'Downtown Location',
      address: '123 Main St, Downtown',
      phone: '555-1234',
      timezone: 'America/New_York',
      openingTime: '11:00:00',
      closingTime: '22:00:00',
    })
    console.log('✓ Created branch')

    // Create staff accounts
    const managerPassword = await hashPassword('manager123')
    const managerAccount = await Account.create({
      email: 'manager@goldenfork.com',
      password: managerPassword,
      firstName: 'John',
      lastName: 'Manager',
      phone: '555-0001',
      account_type: 'staff',
      isActive: true,
    })

    const managerStaff = await Staff.create({
      account_id: managerAccount.id,
      branch_id: branch.id,
      role: 'manager',
      salary: 60000,
    })
    console.log('✓ Created manager account')

    // Create waiter accounts
    const waiterPassword = await hashPassword('waiter123')
    for (let i = 1; i <= 3; i++) {
      const account = await Account.create({
        email: `waiter${i}@goldenfork.com`,
        password: waiterPassword,
        firstName: `Waiter`,
        lastName: `${i}`,
        account_type: 'staff',
      })

      await Staff.create({
        account_id: account.id,
        branch_id: branch.id,
        role: 'waiter',
        salary: 25000,
      })
    }
    console.log('✓ Created waiter accounts')

    // Create chef accounts
    const chefPassword = await hashPassword('chef123')
    for (let i = 1; i <= 2; i++) {
      const account = await Account.create({
        email: `chef${i}@goldenfork.com`,
        password: chefPassword,
        firstName: `Chef`,
        lastName: `${i}`,
        account_type: 'staff',
      })

      await Staff.create({
        account_id: account.id,
        branch_id: branch.id,
        role: 'chef',
        salary: 45000,
      })
    }
    console.log('✓ Created chef accounts')

    // Create receptionist
    const receptionistPassword = await hashPassword('receptionist123')
    const receptionistAccount = await Account.create({
      email: 'receptionist@goldenfork.com',
      password: receptionistPassword,
      firstName: 'Sarah',
      lastName: 'Receptionist',
      account_type: 'staff',
    })

    await Staff.create({
      account_id: receptionistAccount.id,
      branch_id: branch.id,
      role: 'receptionist',
      salary: 28000,
    })
    console.log('✓ Created receptionist account')

    // Create table layout
    const layout = await TableLayout.create({
      branch_id: branch.id,
      gridRows: 5,
      gridCols: 6,
      name: 'Main Dining Area',
    })
    console.log('✓ Created table layout (5x6 grid)')

    // Create tables with seats
    const tables = []
    for (let i = 1; i <= 12; i++) {
      const table = await Table.create({
        layout_id: layout.id,
        tableNumber: i,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        status: 'available',
        gridRow: Math.floor((i - 1) / 6),
        gridCol: (i - 1) % 6,
      })

      // Create seats for table
      const capacity = table.capacity
      for (let j = 1; j <= capacity; j++) {
        await TableSeat.create({
          table_id: table.id,
          seat_number: j,
        })
      }

      tables.push(table)
    }
    console.log(`✓ Created 12 tables with seats`)

    // Create menus
    const menu = await Menu.create({
      branch_id: branch.id,
      name: 'Main Menu',
      description: 'Our signature menu',
      is_active: true,
    })
    console.log('✓ Created menu')

    // Create menu sections
    const appetizersSection = await MenuSection.create({
      menu_id: menu.id,
      name: 'Appetizers',
      display_order: 1,
    })

    const mainsSection = await MenuSection.create({
      menu_id: menu.id,
      name: 'Main Courses',
      display_order: 2,
    })

    const dessertsSection = await MenuSection.create({
      menu_id: menu.id,
      name: 'Desserts',
      display_order: 3,
    })
    console.log('✓ Created menu sections')

    // Create menu items
    const appetizers = [
      { name: 'Bruschetta', price: 8.99, dietary_flags: { vegetarian: true } },
      { name: 'Calamari', price: 10.99, dietary_flags: { seafood: true } },
      { name: 'Spring Rolls', price: 7.99, dietary_flags: { vegetarian: true, gluten_free: false } },
    ]

    for (const appetizer of appetizers) {
      await MenuItem.create({
        menu_section_id: appetizersSection.id,
        name: appetizer.name,
        description: `Delicious ${appetizer.name}`,
        price: appetizer.price,
        currency: 'USD',
        dietary_flags: appetizer.dietary_flags,
        is_available: true,
      })
    }

    const mains = [
      { name: 'Grilled Salmon', price: 24.99, dietary_flags: { gluten_free: true, seafood: true } },
      { name: 'Ribeye Steak', price: 28.99, dietary_flags: { gluten_free: true } },
      { name: 'Pasta Primavera', price: 16.99, dietary_flags: { vegetarian: true } },
      { name: 'Chicken Parmesan', price: 19.99, dietary_flags: {} },
    ]

    for (const main of mains) {
      await MenuItem.create({
        menu_section_id: mainsSection.id,
        name: main.name,
        description: `Chef's special ${main.name}`,
        price: main.price,
        currency: 'USD',
        dietary_flags: main.dietary_flags,
        is_available: true,
      })
    }

    const desserts = [
      { name: 'Chocolate Cake', price: 7.99, dietary_flags: { vegetarian: true } },
      { name: 'Cheesecake', price: 8.99, dietary_flags: { vegetarian: true } },
      { name: 'Sorbet', price: 6.99, dietary_flags: { vegan: true, gluten_free: true } },
    ]

    for (const dessert of desserts) {
      await MenuItem.create({
        menu_section_id: dessertsSection.id,
        name: dessert.name,
        description: `Tempting ${dessert.name}`,
        price: dessert.price,
        currency: 'USD',
        dietary_flags: dessert.dietary_flags,
        is_available: true,
      })
    }
    console.log('✓ Created menu items with dietary flags')

    // Create guest accounts
    const guestPassword = await hashPassword('guest123')
    for (let i = 1; i <= 5; i++) {
      await Account.create({
        email: `guest${i}@example.com`,
        password: guestPassword,
        firstName: `Guest`,
        lastName: `${i}`,
        account_type: 'guest',
      })
    }
    console.log('✓ Created guest accounts')

    console.log('')
    console.log('✅ Database seeding completed!')
    console.log('')
    console.log('Sample login credentials:')
    console.log('  Manager: manager@goldenfork.com / manager123')
    console.log('  Waiter: waiter1@goldenfork.com / waiter123')
    console.log('  Chef: chef1@goldenfork.com / chef123')
    console.log('  Receptionist: receptionist@goldenfork.com / receptionist123')
    console.log('  Guest: guest1@example.com / guest123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
