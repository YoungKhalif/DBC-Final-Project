#!/usr/bin/env node

/**
 * Database Migration: v1 to v2
 * Adds Account discriminator, Staff table, Meal/MealItem hierarchy,
 * TableLayout/TableSeat structure, and Payment tracking.
 *
 * This script drops existing tables and recreates the schema from scratch.
 * For production, create proper Sequelize migrations.
 */

const sequelize = require('../config/database')
const models = require('../models')

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')

    // Force sync: drop and recreate all tables
    await sequelize.sync({ force: true })

    console.log('✅ Database schema created successfully!')
    console.log('')
    console.log('Created tables:')
    console.log('  - accounts (with account_type discriminator)')
    console.log('  - staff (extends account with role, branch_id)')
    console.log('  - restaurants')
    console.log('  - branches')
    console.log('  - table_layouts (floor-plan grid)')
    console.log('  - tables (with layout_id and status)')
    console.log('  - table_seats (with guest tracking)')
    console.log('  - menus')
    console.log('  - menu_sections')
    console.log('  - menu_items (with dietary_flags JSONB)')
    console.log('  - reservations')
    console.log('  - orders')
    console.log('  - meals (grouping layer)')
    console.log('  - meal_items (with unit_price snapshot)')
    console.log('  - bills')
    console.log('  - payments (payment attempts)')
    console.log('  - notifications')
    console.log('')
    console.log('Key design features:')
    console.log('  ✓ UUIDs for all primary keys')
    console.log('  ✓ Account discriminator (staff/guest)')
    console.log('  ✓ Role-based Staff table')
    console.log('  ✓ Meal grouping for multi-course support')
    console.log('  ✓ Price snapshots on MealItems')
    console.log('  ✓ JSONB dietary flags')
    console.log('  ✓ Composite indexes for performance')
    console.log('  ✓ Proper CASCADE/RESTRICT constraints')

    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrate()
