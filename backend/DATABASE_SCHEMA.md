# Database Schema v2 - 18 Entity Model

## Overview

Complete schema implementing a comprehensive restaurant management system with 18 entities organized into 6 logical groups:
- **Identity & Access**: Account (discriminator), Staff
- **Organization**: Restaurant, Branch
- **Venue**: TableLayout, Table, TableSeat
- **Menu**: Menu, MenuSection, MenuItem
- **Operations**: Reservation, Order, Meal, MealItem
- **Billing**: Bill, Payment
- **Notifications**: Notification

---

## Entity Definitions

### Identity & Access

#### Account (discriminator pattern)
- **PK**: `id` (UUID)
- **Fields**:
  - `email` (STRING, unique)
  - `password` (STRING, hashed)
  - `firstName`, `lastName` (STRING)
  - `phone` (STRING, nullable)
  - `account_type` (ENUM: 'staff' | 'guest') - discriminator
  - `isActive` (BOOLEAN, default true)
  - `lastLogin` (DATE, nullable)
  - `createdAt`, `updatedAt` (TIMESTAMP)
- **Indexes**: `email` (unique), `account_type`
- **Purpose**: Single parent table for all users; split roles via `account_type`

#### Staff (extends Account)
- **PK**: `id` (UUID)
- **FK**: `account_id` (UUID, unique) → Account
- **FK**: `branch_id` (UUID) → Branch
- **Fields**:
  - `role` (ENUM: 'receptionist' | 'waiter' | 'manager' | 'chef')
  - `hireDate` (DATE, default NOW)
  - `salary` (DECIMAL(12, 2), nullable)
  - `isActive` (BOOLEAN)
- **Indexes**: `account_id` (unique), `branch_id`, `(branch_id, role)`
- **Purpose**: Staff-specific data; guests have null Staff row

---

### Organization

#### Restaurant (root tenant)
- **PK**: `id` (UUID)
- **Fields**:
  - `name` (STRING, not null)
  - `description` (TEXT)
  - `phone`, `email` (STRING)
  - `address` (STRING)
  - `isActive` (BOOLEAN)
- **Indexes**: `name`
- **Purpose**: Top-level tenant entity; one per brand

#### Branch (multi-tenant structure)
- **PK**: `id` (UUID)
- **FK**: `restaurant_id` (UUID) → Restaurant (CASCADE)
- **Fields**:
  - `name` (STRING)
  - `address`, `phone` (STRING)
  - `timezone` (STRING, default 'UTC')
  - `openingTime`, `closingTime` (TIME)
  - `isOpen` (BOOLEAN)
  - `isActive` (BOOLEAN)
- **Indexes**: `restaurant_id`, `name`
- **Purpose**: Location/outlet of a restaurant

---

### Venue

#### TableLayout (floor-plan grid)
- **PK**: `id` (UUID)
- **FK**: `branch_id` (UUID) → Branch (CASCADE)
- **Fields**:
  - `gridRows`, `gridCols` (INTEGER, for UI floor-plan)
  - `name` (STRING, default 'Main Dining Area')
- **Indexes**: `branch_id`
- **Purpose**: Defines floor-plan dimensions for a branch

#### Table (physical dining table)
- **PK**: `id` (UUID)
- **FK**: `layout_id` (UUID) → TableLayout (CASCADE)
- **Fields**:
  - `tableNumber` (INTEGER)
  - `capacity` (INTEGER, default 4)
  - `status` (ENUM: 'available' | 'occupied' | 'reserved' | 'cleaning')
  - `gridRow`, `gridCol` (INTEGER) - position in layout
  - `location` (STRING)
  - `notes` (TEXT)
- **Indexes**: `layout_id`, `(layout_id, status)`
- **Purpose**: Physical table; status tracks real-time state

#### TableSeat (tracked seating)
- **PK**: `id` (UUID)
- **FK**: `table_id` (UUID) → Table (CASCADE)
- **FK**: `guest_account_id` (UUID) → Account (SET NULL, optional)
- **Fields**:
  - `seat_number` (INTEGER)
  - `isOccupied` (BOOLEAN)
- **Indexes**: `table_id`, `(table_id, seat_number)` (unique)
- **Purpose**: Track which guest sits at which seat for split billing

---

### Menu

#### Menu
- **PK**: `id` (UUID)
- **FK**: `branch_id` (UUID) → Branch
- **Fields**:
  - `name`, `description` (STRING/TEXT)
  - `is_active` (BOOLEAN)
- **Indexes**: `branch_id`
- **Purpose**: Menu collection (e.g., "Main Menu", "Happy Hour")

#### MenuSection
- **PK**: `id` (UUID)
- **FK**: `menu_id` (UUID) → Menu (CASCADE)
- **Fields**:
  - `name` (STRING) - e.g., "Appetizers", "Mains"
  - `description` (TEXT)
  - `display_order` (INTEGER, default 0)
- **Indexes**: `menu_id`
- **Purpose**: Category within a menu

#### MenuItem
- **PK**: `id` (UUID)
- **FK**: `menu_section_id` (UUID) → MenuSection (CASCADE)
- **Fields**:
  - `name`, `description` (STRING/TEXT)
  - `price` (DECIMAL(10, 2))
  - `currency` (STRING, default 'USD')
  - `dietary_flags` (JSONB, default `{}`)
    - Example: `{vegetarian: true, gluten_free: false, allergens: ["nuts"]}`
  - `is_available` (BOOLEAN)
  - `display_order` (INTEGER)
- **Indexes**: `menu_section_id`
- **Purpose**: Individual dish; JSONB allows flexible dietary attributes

---

### Operations

#### Reservation
- **PK**: `id` (UUID)
- **FK**: `branch_id` (UUID) → Branch
- **FK**: `table_id` (UUID) → Table (nullable, SET NULL)
- **FK**: `account_id` (UUID) → Account (optional, for registered guests)
- **Fields**:
  - `guestName` (STRING)
  - `email`, `phone` (STRING, nullable)
  - `party_size` (INTEGER)
  - `scheduled_at` (DATE)
  - `status` (ENUM: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'no_show')
  - `notes` (TEXT)
- **Indexes**: `branch_id`, `account_id`, `(scheduled_at, branch_id, status)`
- **Purpose**: Table reservation; supports walk-ins (no account_id)

#### Order
- **PK**: `id` (UUID)
- **FK**: `table_id` (UUID) → Table
- **FK**: `waiter_id` (UUID) → Account (Staff.role='waiter')
- **Fields**:
  - `status` (ENUM: 'draft' | 'submitted' | 'in_kitchen' | 'ready' | 'served' | 'closed')
  - `placed_at` (DATE)
  - `notes` (TEXT)
- **Indexes**: `table_id`, `(table_id, placed_at DESC)`
- **Purpose**: Customer order; tracks lifecycle from draft to served

#### Meal (grouping layer)
- **PK**: `id` (UUID)
- **FK**: `order_id` (UUID) → Order (CASCADE)
- **Fields**:
  - `course_number` (INTEGER, default 1) - for multi-course ordering
  - `notes` (TEXT)
- **Indexes**: `order_id`
- **Purpose**: Groups MealItems by course; allows partial kitchen dispatch

#### MealItem (line item with snapshot)
- **PK**: `id` (UUID)
- **FK**: `meal_id` (UUID) → Meal (CASCADE)
- **FK**: `menu_item_id` (UUID) → MenuItem
- **Fields**:
  - `quantity` (INTEGER, default 1)
  - `unit_price` (DECIMAL(10, 2)) - **snapshot** of MenuItem.price at order time
  - `special_instructions` (TEXT)
  - `status` (ENUM: 'pending' | 'preparing' | 'ready' | 'served')
- **Indexes**: `meal_id`
- **Purpose**: Line item; unit_price protects historical orders from menu price changes

---

### Billing

#### Bill (1:1 with Order by default)
- **PK**: `id` (UUID)
- **FK**: `order_id` (UUID, unique) → Order
- **Fields**:
  - `subtotal` (DECIMAL(12, 2))
  - `tax` (DECIMAL(12, 2))
  - `discount` (DECIMAL(12, 2), default 0)
  - `total` (DECIMAL(12, 2))
  - `currency` (STRING, default 'USD')
  - `status` (ENUM: 'open' | 'paid' | 'voided')
  - `paid_at` (DATE, nullable)
- **Indexes**: `order_id` (unique)
- **Purpose**: Invoice; normally 1:1 per order
- **Note**: For split bills (multiple guests paying), extend with `bill_seat_id` FK to TableSeat

#### Payment
- **PK**: `id` (UUID)
- **FK**: `bill_id` (UUID) → Bill (CASCADE)
- **Fields**:
  - `method` (ENUM: 'cash' | 'card' | 'mobile' | 'comp')
  - `amount` (DECIMAL(12, 2))
  - `status` (ENUM: 'pending' | 'completed' | 'failed' | 'refunded')
  - `provider_reference` (STRING, nullable) - for gateway integration
  - `notes` (TEXT)
- **Indexes**: `bill_id`
- **Purpose**: Records each payment attempt; supports partial/multiple payments

---

### Notifications

#### Notification (observer pattern output)
- **PK**: `id` (UUID)
- **FK**: `recipient_account_id` (UUID) → Account (CASCADE)
- **Fields**:
  - `type` (ENUM: 'order_update' | 'reservation_reminder' | 'table_ready' | 'payment_received' | 'system')
  - `payload` (JSONB) - structured event data
    - Example: `{order_id: "...", new_status: "ready", table_number: 5}`
  - `is_read` (BOOLEAN, default false)
  - `read_at` (DATE, nullable)
- **Indexes**: `recipient_account_id`, `(recipient_account_id, is_read)` - for unread badge
- **Purpose**: Event output for observer pattern; WebSocket pushes to clients

---

## Relationships Summary

```
Restaurant ──┬─→ Branch ──┬─→ TableLayout ──→ Table ──┬─→ Order ──→ Meal ──→ MealItem
             │            │                   └─→ TableSeat (guest tracking)
             │            │
             │            ├─→ Menu ──→ MenuSection ──→ MenuItem
             │            │
             │            ├─→ Reservation ──┘ (references Table)
             │            │
             │            └─→ Staff ──→ Account
             │
             └─→ Account ──┬─→ Notification
                           └─→ Reservation (optional, for registered guests)
                           └─→ TableSeat (guest seating)

Bill ──→ Order, Payment
```

## Key Design Decisions

1. **Account Discriminator**: `staff` | `guest` - single parent avoiding NULL joins
2. **Staff Satellite Table**: Holds `role`, `branch_id`; keeps Account lean
3. **TableLayout + Table + TableSeat**: Supports floor-plan visualization and seat-level tracking
4. **Meal + MealItem**: Groups items by course; enables partial kitchen dispatch
5. **unit_price on MealItem**: Price snapshot protects historical orders
6. **dietary_flags as JSONB**: Flexible schema for menu attributes without migration
7. **Bill 1:1 Order (default)**: Extension point for split billing via `bill_seat_id`
8. **Notification.payload as JSONB**: Structured events for flexible rendering
9. **UUIDs everywhere**: Multi-branch safe; supports federation
10. **Composite indexes**: `(branch_id, status)` on Table, `(table_id, placed_at)` on Order, etc.

---

## Migration Scripts

Run migrations with:
```bash
npm run migrate    # Create/sync all tables
npm run seed       # Populate sample data
```

---

## Usage Examples

### Create an Order
```javascript
const order = await orderService.createOrder(tableId, waiterId, [
  {
    course_number: 1,
    items: [
      { menuItemId: "...", quantity: 2, special_instructions: "no onions" },
      { menuItemId: "...", quantity: 1 }
    ]
  },
  {
    course_number: 2,
    items: [
      { menuItemId: "...", quantity: 1 }
    ]
  }
])
```

### Generate Bill (auto-calculates tax)
```javascript
const bill = await paymentService.generateBill(orderId)
// Returns: { subtotal, tax (10%), discount, total }
```

### Query Reservations by Date Range
```javascript
const reservations = await reservationService.getReservationsByBranch(branchId, {
  dateRange: { start: "2024-04-01", end: "2024-04-30" },
  status: "confirmed"
})
```

### Real-time Floor View (Table Statuses)
```javascript
const tables = await tableService.getTablesByLayout(layoutId)
// Includes: { status, capacity, currentOrder, seatedGuests[] }
```

---

## Indexes for Performance

Beyond PKs and FKs:
- `(branch_id, status)` on `TABLE` - real-time floor view
- `(table_id, placed_at DESC)` on `ORDER` - current table orders
- `(recipient_account_id, is_read)` on `NOTIFICATION` - unread badge count
- `(scheduled_at, branch_id, status)` on `RESERVATION` - daily grid
- `(menu_id)` on `MENU_SECTION`, `(menu_section_id)` on `MENU_ITEM` - menu tree
- `email` (unique) on `ACCOUNT` - authentication

