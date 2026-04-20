# Database Schema & Architecture Refactor - Summary

## What Changed

This refactor introduces a **comprehensive 18-entity schema** supporting multi-branch restaurant operations with complete menu, ordering, reservation, and billing functionality.

### Key Improvements

1. **Scalable Multi-Tenancy**: Restaurant → Branch hierarchy allows multiple locations
2. **Discriminator Pattern**: Single Account table with `account_type` ('staff'|'guest') prevents NULL joins
3. **Floor-Plan Support**: TableLayout + Table + TableSeat enables floor-plan visualization and seat-level operations
4. **Order History Integrity**: MealItem.unit_price snapshots menu price at order time
5. **Flexible Menu Attributes**: JSONB dietary_flags allows dietary/allergen tracking without schema migrations
6. **Split Billing Ready**: TableSeat tracking enables future split-bill features
7. **Real-time Operations**: Table status, order lifecycle, and reservation tracking
8. **Notifications**: Observer pattern output for WebSocket/event stream delivery

---

## New Entities (18 Total)

### Core
- **Account**: User parent (staff/guest discriminator)
- **Staff**: Staff-specific data (role, branch_id, hire_date)
- **Restaurant**: Tenant root
- **Branch**: Location (multi-tenant)

### Venue
- **TableLayout**: Floor-plan grid
- **Table**: Physical table with status tracking
- **TableSeat**: Per-seat tracking for split billing

### Menu
- **Menu**: Menu collection per branch
- **MenuSection**: Categories (Appetizers, Mains, etc.)
- **MenuItem**: Individual dishes with price and dietary flags

### Operations
- **Reservation**: Booking with flexible guest types
- **Order**: Customer order with lifecycle states
- **Meal**: Course grouping within order
- **MealItem**: Line item with price snapshot

### Billing & Notifications
- **Bill**: Invoice from order
- **Payment**: Payment record with multi-method support
- **Notification**: Event output for real-time delivery

---

## Files Updated

### Documentation
1. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete entity definitions
2. **[API_REFERENCE.md](API_REFERENCE.md)** - Full endpoint reference with request/response examples
3. **[SERVICE_IMPLEMENTATION.md](SERVICE_IMPLEMENTATION.md)** - Service layer architecture and code patterns

### Backend Code
1. **[src/middleware/auth.js](src/middleware/auth.js)** - Updated to handle Account discriminator and Staff association

---

## Breaking Changes

### Authentication
```javascript
// Old
req.user = { id, email, role }
authorize(['admin'])

// New
req.user = {
  id, email, firstName, lastName,
  account_type: 'staff'|'guest',
  staff: { id, role: 'waiter'|'manager'|'chef'|'receptionist', branch_id }
}
authorize(['waiter', 'manager'])  // Staff only
authorize(['guest'])               // Guests
```

### Account Creation
```javascript
// Old
POST /api/auth/register
{ email, password, role }

// New
POST /api/auth/register
{
  email, password, firstName, lastName, phone,
  account_type: 'staff'|'guest'
}
```

If creating staff, an empty Staff record is created with default branch (admin assigns later).

---

## Migration Path (If Existing Data)

```bash
# 1. Backup current database
mysqldump -u root restaurant_db > backup.sql

# 2. Run schema migrations
npm run migrate

# 3. Seed sample data (optional)
npm run seed

# 4. Update frontend to use new auth structure
# - Get account_type from token
# - Use staff.role for authorization checks
# - Update menu display to read dietary_flags

# 5. Test critical paths
npm test
```

---

## Next Steps for Implementation

### Phase 1: Core Infrastructure
- [ ] Generate Sequelize models from schema (18 models + migrations)
- [ ] Implement AuthService with discriminator logic
- [ ] Update auth middleware (✅ done)
- [ ] Create test fixtures

### Phase 2: Core Services
- [ ] TableService (floor-plan, status, seating)
- [ ] MenuService (menu tree, item management)
- [ ] OrderService (order creation, status lifecycle)
- [ ] ReservationService (booking, assignment)

### Phase 3: Billing & Notifications
- [ ] PaymentService (bill generation, payments, split billing)
- [ ] NotificationService (event broadcast, WebSocket integration)
- [ ] EventBus (order, table, reservation events)

### Phase 4: Controllers & Validation
- [ ] REST controllers for all 18 entities
- [ ] Request validation (Joi/Zod)
- [ ] Error handling middleware
- [ ] Audit logging

### Phase 5: Frontend Integration
- [ ] Update login to handle new auth structure
- [ ] Floor-plan view for table management
- [ ] Real-time table/order updates (Socket.IO)
- [ ] Split bill UI components

---

## Design Highlights

### 1. Price Snapshots
```javascript
// When order is placed, MenuItem price is captured
MealItem.unit_price = MenuItem.price  // 15.99 at order time
// If menu price changes later, historical order is unaffected
```

### 2. Table Status Workflow
```
available → (guest seated) → occupied → (bill paid, clear seat) → cleaning → available
```

### 3. Order Lifecycle
```
draft → submitted → in_kitchen → ready → served → closed
         (placed_at set)
```

### 4. Flexible Dietary Tracking
```javascript
MenuItem.dietary_flags = {
  vegetarian: true,
  gluten_free: false,
  vegan: false,
  allergens: ['nuts', 'shellfish']
}
// Allows dietary filtering without schema changes
```

### 5. Seat-Level Tracking for Split Bills
```
Table (4 seats)
├── Seat 1 → Guest A → Bill A (items ordered at seat 1)
├── Seat 2 → Guest B → Bill B (items ordered at seat 2)
├── Seat 3 → Guest C → Bill C (items ordered at seat 3)
└── Seat 4 → (empty)
```

---

## Performance Considerations

### Indexes Added
- `(branch_id, status)` on Table - real-time floor view queries
- `(table_id, placed_at DESC)` on Order - recent orders
- `(recipient_account_id, is_read)` on Notification - unread badge
- `(scheduled_at, branch_id, status)` on Reservation - daily booking grid
- `email` (unique) on Account - authentication

### Query Examples
```javascript
// Get floor plan with active orders
SELECT t.*, COUNT(ts) as occupied_seats, o.status as current_order_status
FROM table t
LEFT JOIN table_seat ts ON ts.table_id = t.id AND ts.isOccupied = true
LEFT JOIN order o ON o.table_id = t.id AND o.status != 'closed'
WHERE t.layout_id = ?
GROUP BY t.id

// Get unread notification count
SELECT COUNT(*) FROM notification
WHERE recipient_account_id = ? AND is_read = false

// Get reservations for day
SELECT * FROM reservation
WHERE branch_id = ? AND DATE(scheduled_at) = CURDATE()
ORDER BY scheduled_at ASC
```

---

## Security Notes

1. **Password Hashing**: Use bcrypt in AuthService
2. **Token Expiration**: JWT exp: 24h for login tokens
3. **Role-Based Access**: authorize() middleware enforces staff roles
4. **Soft Deletes**: Consider adding deletedAt timestamp (not in initial schema)
5. **Audit Trail**: Log sensitive operations (staff hires, discounts, refunds)

---

## Frontend Considerations

### Login Response
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "account_type": "staff",
    "staff": {
      "id": "uuid",
      "role": "waiter",
      "branch_id": "uuid"
    }
  }
}
```

### Authorization Check
```javascript
// Is user a manager?
const isManager = user.staff?.role === 'manager'

// Is user a guest?
const isGuest = user.account_type === 'guest'

// Can user access branch?
const canAccessBranch = user.staff?.branch_id === currentBranchId
```

### Real-time Updates
```javascript
// WebSocket listeners
socket.on('table:status', (data) => {
  // Update floor-plan: table 5 is now occupied
  updateTableUI(data.tableId, data.status)
})

socket.on('notification:new', (data) => {
  // Show badge, play sound, etc.
  showNotification(data.type, data.payload)
})
```

---

## Validation Rules

### Account Registration
- email: unique, valid format
- password: min 8 chars, complexity check
- firstName/lastName: 2-50 chars
- account_type: enum ['staff', 'guest']

### Order Creation
- table_id: must exist, capacity >= items
- waiter_id: must be staff with role='waiter'
- meals: min 1 meal, min 1 item per meal
- special_instructions: max 500 chars

### Reservation
- party_size: 1-20
- scheduled_at: future date/time only
- branch opening/closing hours validation

### Payment
- amount: decimal(12,2), > 0
- method: enum ['cash', 'card', 'mobile', 'comp']
- amount <= bill.total (or split bill amount)

---

## Deployment Checklist

- [ ] All migrations written and tested
- [ ] Seed data includes sample restaurant, branches, menus
- [ ] Auth middleware deployed and tested
- [ ] All 18 service classes implemented
- [ ] Controllers and routes wired
- [ ] Database indexes created
- [ ] Error handling middleware in place
- [ ] Logging configured
- [ ] Frontend auth updated
- [ ] WebSocket events configured
- [ ] Load testing on table queries (floor-plan)
- [ ] Backup strategy documented

---

## Questions?

Refer to:
- **Schema Details**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **API Details**: [API_REFERENCE.md](API_REFERENCE.md)
- **Implementation Details**: [SERVICE_IMPLEMENTATION.md](SERVICE_IMPLEMENTATION.md)

