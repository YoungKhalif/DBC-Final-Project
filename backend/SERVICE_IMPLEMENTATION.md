# Implementation Guide - Service Layer Architecture

## Overview

The service layer contains business logic organized by domain. Each service handles:
- Data validation
- Business rule enforcement
- Transaction management
- Error handling
- Audit logging

---

## Service Structure

```
src/services/
├── auth.service.js          # Account creation, login, token management
├── restaurant.service.js    # Restaurant and branch operations
├── table.service.js         # Table management, floor-plan operations
├── menu.service.js          # Menu, section, item management
├── order.service.js         # Order creation, status updates
├── meal.service.js          # Meal and meal item operations
├── reservation.service.js   # Reservation booking, status changes
├── payment.service.js       # Bill generation, payment processing
├── notification.service.js  # Notification creation and delivery
└── staff.service.js         # Staff profile management
```

---

## Key Service Methods

### AuthService

```javascript
class AuthService {
  // Create new account (staff or guest)
  async registerAccount(email, password, firstName, lastName, account_type)
    // - Hash password
    // - Check email uniqueness
    // - Create Account record
    // - If staff: create Staff record with default role
    // - Return account object

  // Authenticate and generate JWT
  async login(email, password)
    // - Verify password
    // - Update lastLogin
    // - Generate token (exp: 24h)
    // - Return { token, user }

  // Verify token and return payload
  async verifyToken(token)
    // - Decode and validate
    // - Check expiration
    // - Return payload

  // Promote guest to staff (admin only)
  async promoteToStaff(accountId, branchId, role)
    // - Create Staff record
    // - Update account_type if needed
    // - Emit notification
}
```

### TableService

```javascript
class TableService {
  // Get floor plan with real-time table statuses
  async getTableLayout(layoutId)
    // - Load TableLayout
    // - Include Table[] with status
    // - Include TableSeat[] with guest details
    // - Include current Order for occupied tables
    // - Aggregate seat count by status

  // Create table with seats
  async createTable(layoutId, tableNumber, capacity, gridRow, gridCol)
    // - Validate layout bounds
    // - Check table number uniqueness within layout
    // - Create Table
    // - Create capacity × TableSeat records
    // - Return with seats

  // Update table status with rules
  async updateTableStatus(tableId, newStatus)
    // - Validate status transition (available → occupied, occupied → cleaning)
    // - If available: check no active orders
    // - Update Table.status
    // - Emit WebSocket event 'table:status'
    // - Log audit trail

  // Seat guest at table/seat
  async assignGuestToSeat(tableId, seatNumber, guestAccountId)
    // - Verify table exists
    // - Verify seat not occupied
    // - Create/update TableSeat.guest_account_id
    // - Mark TableSeat.isOccupied = true
    // - If all seats occupied: auto-update Table.status = 'occupied'
    // - Emit WebSocket event

  // Release guest from seat
  async releaseSeat(tableId, seatNumber)
    // - Mark TableSeat.isOccupied = false
    // - Clear guest_account_id
    // - If all seats empty: Table.status = 'available'
    // - Emit WebSocket event
}
```

### OrderService

```javascript
class OrderService {
  // Create order in draft state
  async createOrder(tableId, waiterId, mealStructure)
    // - Verify table and waiter exist
    // - Validate menu items available
    // - Start transaction
    // - Create Order { status: 'draft', placed_at: null }
    // - For each meal:
    //   - Create Meal
    //   - For each item:
    //     - Snapshot MenuItem.price → unit_price
    //     - Create MealItem { status: 'pending' }
    // - Return full order with meals/items
    // - Rollback if validation fails

  // Submit order (draft → submitted → in_kitchen)
  async submitOrder(orderId)
    // - Get Order with Meals and MealItems
    // - Validate all items available
    // - Update Order.status = 'submitted'
    // - Update Order.placed_at = NOW
    // - Create kitchen display notification
    // - Emit 'order:status' WebSocket
    // - Return updated order

  // Get active orders for table
  async getTableOrders(tableId)
    // - Query Order where table_id and status != 'closed'
    // - Include Meal[] with MealItem[]
    // - Include MenuItem details
    // - Sort by placed_at DESC

  // Update meal item status (kitchen operations)
  async updateMealItemStatus(mealItemId, newStatus)
    // - Validate status transition (pending → preparing → ready)
    // - Update MealItem.status
    // - If all items ready: update Meal.status = 'ready'
    // - If all meals ready: suggest Order.status = 'ready'
    // - Emit 'meal_item:status' WebSocket

  // Mark order as served
  async markOrderServed(orderId)
    // - Update Order.status = 'served'
    // - Update all MealItem.status = 'served'
    // - Emit WebSocket
    // - Trigger bill generation suggestion

  // Close order
  async closeOrder(orderId)
    // - Verify Order.status = 'served'
    // - Update Order.status = 'closed'
    // - Check if table can transition to available
    // - Emit WebSocket
}
```

### ReservationService

```javascript
class ReservationService {
  // Create reservation (walk-in or registered guest)
  async createReservation(branchId, guestName, email, phone, partySize, scheduledAt, accountId = null)
    // - Validate branch open at scheduled_at
    // - Validate party_size > 0
    // - Create Reservation { status: 'pending' }
    // - If registered guest: link account_id
    // - Return reservation

  // Get reservations by date range and status
  async getReservationsByBranch(branchId, { dateRange, status })
    // - Query Reservation where:
    //   - branch_id = branchId
    //   - scheduled_at BETWEEN start AND end
    //   - status IN status
    // - Include Table details if assigned
    // - Sort by scheduled_at ASC
    // - Return paginated list

  // Get upcoming reservations (next N hours)
  async getUpcomingReservations(branchId, hoursAhead = 2)
    // - Query Reservation where:
    //   - scheduled_at BETWEEN NOW AND NOW + hoursAhead
    //   - status IN ['pending', 'confirmed']
    // - Include Table and guest details
    // - Sort by scheduled_at ASC

  // Assign table to reservation
  async assignTableToReservation(reservationId, tableId)
    // - Verify reservation exists and pending
    // - Verify table capacity >= party_size
    // - Verify table status = 'available'
    // - Update Reservation.table_id
    // - Update Reservation.status = 'confirmed'
    // - Send confirmation notification to guest
    // - Emit WebSocket

  // Update reservation status
  async updateReservationStatus(reservationId, newStatus)
    // - Validate status transition
    // - Update Reservation.status
    // - If seated: call Table.updateStatus('occupied')
    // - If cancelled: release assigned table
    // - Emit WebSocket and notification

  // Check for no-shows
  async processNoShows()
    // - Query overdue reservations (scheduled_at + 15min past, still 'confirmed')
    // - Update status = 'no_show'
    // - Release assigned tables
    // - Log audit trail
    // - Emit notifications
}
```

### PaymentService

```javascript
class PaymentService {
  // Generate bill from order
  async generateBill(orderId)
    // - Get Order with MealItems
    // - Calculate subtotal = SUM(MealItem.unit_price × quantity)
    // - Calculate tax = subtotal × TAX_RATE (e.g., 0.10)
    // - Create Bill { subtotal, tax, total, status: 'open' }
    // - Return bill with line items

  // Apply discount
  async applyDiscount(billId, discountAmount)
    // - Verify Bill.status = 'open'
    // - Validate discountAmount <= Bill.subtotal
    // - Update Bill.discount
    // - Recalculate Bill.total
    // - Log discount reason (admin note)

  // Process payment
  async processPayment(billId, method, amount)
    // - Verify Bill.status = 'open'
    // - Validate amount matches Bill.total or partial
    // - Create Payment { status: 'pending' }
    // - If method = 'card': call PaymentGateway.charge()
    // - On success:
    //   - Update Payment.status = 'completed'
    //   - If full amount: Bill.status = 'paid', Bill.paid_at = NOW
    //   - Emit WebSocket 'bill:paid'
    //   - Create notification to staff
    // - Return { bill, payment }

  // Handle refund
  async refundPayment(paymentId)
    // - Verify Payment.status = 'completed'
    // - Call PaymentGateway.refund()
    // - Update Payment.status = 'refunded'
    // - If all payments refunded: Bill.status = 'voided'
    // - Emit WebSocket and notification

  // Split bill (advanced)
  async generateSplitBill(tableId, seatNumbers)
    // - Get Order with MealItems
    // - For each seat: sum items seated at that seat
    // - Create Bill for each seat
    // - Update Bill.bill_seat_id reference
    // - Return array of bills
}
```

### NotificationService

```javascript
class NotificationService {
  // Create notification
  async createNotification(recipientAccountId, type, payload)
    // - Create Notification
    // - Emit WebSocket to recipient (if connected)
    // - Store in DB for retrieval

  // Get unread count
  async getUnreadCount(accountId)
    // - Count where account_id and is_read = false

  // Mark as read
  async markAsRead(notificationId)
    // - Update Notification { is_read: true, read_at: NOW }

  // Broadcast to role
  async broadcastToRole(branchId, role, type, payload)
    // - Get all Staff where branch_id and role
    // - Create notification for each
    // - Emit WebSocket to all

  // Send system notification
  async sendSystemNotification(branchId, type, payload)
    // - Broadcast to all staff in branch
}
```

---

## Transaction Management Example

```javascript
// Order Creation with Transaction
async createOrder(tableId, waiterId, meals) {
  const transaction = await sequelize.transaction()
  
  try {
    // 1. Create Order
    const order = await Order.create(
      { table_id: tableId, waiter_id: waiterId, status: 'draft' },
      { transaction }
    )

    // 2. Create Meals and Items (nested)
    for (const mealData of meals) {
      const meal = await Meal.create(
        { order_id: order.id, course_number: mealData.course_number },
        { transaction }
      )

      for (const itemData of mealData.items) {
        const menuItem = await MenuItem.findByPk(itemData.menu_item_id)
        
        await MealItem.create(
          {
            meal_id: meal.id,
            menu_item_id: menuItem.id,
            quantity: itemData.quantity,
            unit_price: menuItem.price,  // Snapshot
            special_instructions: itemData.special_instructions,
          },
          { transaction }
        )
      }
    }

    // 3. Commit
    await transaction.commit()

    // 4. Reload with associations
    const fullOrder = await Order.findByPk(order.id, { 
      include: [Meal, { association: 'meals', include: [MealItem, MenuItem] }]
    })

    // 5. Emit event (after commit)
    this.eventBus.emit('order:created', { orderId: fullOrder.id, tableId })
    
    return fullOrder
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

---

## Error Handling Pattern

```javascript
class ServiceError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
  }
}

// Usage
if (!table) {
  throw new ServiceError('TABLE_NOT_FOUND', `Table ${tableId} not found`, 404)
}

// Controller catches and responds
try {
  const result = await orderService.createOrder(...)
  res.json(result)
} catch (error) {
  if (error instanceof ServiceError) {
    res.status(error.statusCode).json({ error: error.message, code: error.code })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

---

## Testing Services

```javascript
describe('OrderService', () => {
  let orderService, mockOrderRepo, mockMealItemRepo

  beforeEach(() => {
    // Mock repositories
    mockOrderRepo = sinon.mock(Order)
    mockMealItemRepo = sinon.mock(MealItem)
    
    orderService = new OrderService(mockOrderRepo, mockMealItemRepo)
  })

  it('should snapshot menu item price on order creation', async () => {
    const menuItem = { id: 'menu-1', price: 15.99 }
    
    const order = await orderService.createOrder('table-1', 'waiter-1', [
      { course_number: 1, items: [{ menu_item_id: 'menu-1', quantity: 2 }] }
    ])

    expect(order.meals[0].mealItems[0].unit_price).toBe(15.99)
  })

  it('should reject order if menu item unavailable', async () => {
    const unavailableItem = { id: 'menu-2', is_available: false }
    
    await expect(
      orderService.createOrder('table-1', 'waiter-1', [
        { course_number: 1, items: [{ menu_item_id: 'menu-2', quantity: 1 }] }
      ])
    ).rejects.toThrow('Menu item unavailable')
  })
})
```

---

## Integration with Controllers

```javascript
// controllers/order.controller.js
const { createOrder, submitOrder } = require('../services/order.service')

router.post('/orders', authenticate, authorize(['waiter']), async (req, res, next) => {
  try {
    const { table_id, meals } = req.body
    const order = await createOrder(table_id, req.user.id, meals)
    res.status(201).json(order)
  } catch (error) {
    next(error)  // Pass to error middleware
  }
})

router.post('/orders/:orderId/submit', authenticate, authorize(['waiter']), async (req, res, next) => {
  try {
    const order = await submitOrder(req.params.orderId)
    res.json(order)
  } catch (error) {
    next(error)
  }
})
```

