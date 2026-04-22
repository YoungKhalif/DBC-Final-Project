/**
 * Zod validation schemas for API requests
 * Co-located with routes for visibility of input contracts
 */
const { z } = require('zod')

// Auth schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
})

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
})

// Table schemas
const createTableSchema = z.object({
  layout_id: z.string().uuid('Invalid layout ID'),
  tableNumber: z.number().int().positive('Table number must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  location: z.string().optional(),
  gridRow: z.number().int().nonnegative(),
  gridCol: z.number().int().nonnegative(),
})

const updateTableStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']),
})

// Order schemas
const createOrderSchema = z.object({
  table_id: z.string().uuid('Invalid table ID'),
  meals: z
    .array(
      z.object({
        course_number: z.number().int().positive('Course number must be positive'),
        items: z
          .array(
            z.object({
              menu_item_id: z.string().uuid('Invalid menu item ID'),
              quantity: z.number().int().positive('Quantity must be positive'),
              special_instructions: z.string().optional(),
            })
          )
          .min(1, 'At least one item required'),
      })
    )
    .min(1, 'At least one meal required'),
})

const updateOrderStatusSchema = z.object({
  status: z.enum(['submitted', 'in_kitchen', 'ready', 'served', 'closed', 'cancelled']),
})

// Reservation schemas
const createReservationSchema = z.object({
  branch_id: z.string().uuid('Invalid branch ID'),
  guestName: z.string().min(1, 'Guest name required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  party_size: z.number().int().positive('Party size must be positive').max(20),
  scheduled_at: z.string().datetime('Invalid date/time'),
  notes: z.string().optional(),
  account_id: z.string().uuid().optional(),
})

const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'seated', 'cancelled', 'no_show']),
})

// Meal item schemas
const updateMealItemStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served']),
})

// Payment schemas
const processPaymentSchema = z.object({
  method: z.enum(['cash', 'card', 'mobile', 'comp']),
  amount: z.number().positive('Amount must be positive'),
})

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  createTableSchema,
  updateTableStatusSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createReservationSchema,
  updateReservationStatusSchema,
  updateMealItemStatusSchema,
  processPaymentSchema,
}
