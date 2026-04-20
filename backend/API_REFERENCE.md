# API Endpoints Reference - 18 Entity Schema

## Authentication Endpoints

### Register Account
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "account_type": "guest"  // or "staff"
}

Response: 200
{
  "user": { id, email, firstName, lastName, account_type, staff? }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { id, email, firstName, lastName, account_type, staff? }
}

All subsequent requests must include: Authorization: Bearer <token>
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "account_type": "staff",
  "staff": {
    "id": "uuid",
    "role": "waiter",
    "branch_id": "uuid"
  }
}
```

---

## Restaurant & Branch Endpoints

### Get Restaurants
```
GET /api/restaurants
Authorization: Bearer <token>

Response: 200 [{ id, name, description, address, isActive, createdAt }]
```

### Get Branches by Restaurant
```
GET /api/restaurants/:restaurantId/branches
Authorization: Bearer <token>

Response: 200 [{ id, name, address, timezone, openingTime, closingTime, isOpen }]
```

---

## Table Layout & Management Endpoints

### Get Table Layout with All Tables
```
GET /api/branches/:branchId/table-layout
Authorization: Bearer <token>

Response: 200
{
  "layout": { id, gridRows, gridCols, name },
  "tables": [
    {
      "id": "uuid",
      "tableNumber": 1,
      "capacity": 4,
      "status": "available",
      "gridRow": 0,
      "gridCol": 0,
      "seats": [
        { "id", "seat_number": 1, "isOccupied": false, "guest": null }
      ],
      "currentOrder": null
    }
  ]
}
```

### Get Table Details with Current Order
```
GET /api/tables/:tableId
Authorization: Bearer <token>

Response: 200
{
  "id": "uuid",
  "tableNumber": 5,
  "capacity": 4,
  "status": "occupied",
  "layout": { id, gridRows, gridCols },
  "seats": [
    {
      "id": "uuid",
      "seat_number": 1,
      "guest": { id, firstName, lastName }
    }
  ],
  "orders": [
    {
      "id": "uuid",
      "status": "in_kitchen",
      "placed_at": "2024-04-20T18:30:00Z",
      "meals": [
        {
          "id": "uuid",
          "course_number": 1,
          "mealItems": [
            {
              "id": "uuid",
              "quantity": 2,
              "unit_price": "15.99",
              "status": "preparing",
              "menuItem": { id, name, price, dietary_flags }
            }
          ]
        }
      ]
    }
  ]
}
```

### Create Table
```
POST /api/tables
Authorization: Bearer <token>
Authorization role: manager

{
  "layout_id": "uuid",
  "tableNumber": 13,
  "capacity": 4,
  "location": "Window Seat",
  "gridRow": 2,
  "gridCol": 4
}

Response: 201 { id, tableNumber, capacity, status, seats[] }
```

### Update Table Status
```
PATCH /api/tables/:tableId/status
Authorization: Bearer <token>

{
  "status": "occupied"  // or: available, reserved, cleaning
}

Response: 200 { id, tableNumber, status, ... }
```

### Assign Guest to Seat
```
POST /api/tables/:tableId/seats/:seatNumber/assign
Authorization: Bearer <token>

{
  "guest_account_id": "uuid"
}

Response: 200 { id, seat_number, guest_account_id, isOccupied }
```

---

## Menu Endpoints

### Get Menu for Branch
```
GET /api/menus/branch/:branchId
Authorization: Bearer <token>

Response: 200
[
  {
    "id": "uuid",
    "name": "Main Menu",
    "is_active": true,
    "sections": [
      {
        "id": "uuid",
        "name": "Appetizers",
        "display_order": 1,
        "items": [
          {
            "id": "uuid",
            "name": "Bruschetta",
            "description": "...",
            "price": "8.99",
            "currency": "USD",
            "dietary_flags": { "vegetarian": true },
            "is_available": true
          }
        ]
      }
    ]
  }
]
```

### Create Menu
```
POST /api/menus
Authorization: Bearer <token>
Authorization role: manager

{
  "branch_id": "uuid",
  "name": "Happy Hour Menu",
  "description": "Special pricing 5-7pm"
}

Response: 201 { id, name, is_active, sections: [] }
```

### Create Menu Item
```
POST /api/menu-items
Authorization: Bearer <token>
Authorization role: manager

{
  "menu_section_id": "uuid",
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon with seasonal vegetables",
  "price": "24.99",
  "currency": "USD",
  "dietary_flags": {
    "gluten_free": true,
    "seafood": true,
    "allergens": ["shellfish"]
  },
  "is_available": true,
  "display_order": 3
}

Response: 201 { id, name, price, dietary_flags, is_available, ... }
```

---

## Order & Meal Endpoints

### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Authorization role: waiter

{
  "table_id": "uuid",
  "meals": [
    {
      "course_number": 1,
      "items": [
        {
          "menu_item_id": "uuid",
          "quantity": 2,
          "special_instructions": "No onions, extra lemon"
        }
      ]
    },
    {
      "course_number": 2,
      "items": [
        {
          "menu_item_id": "uuid",
          "quantity": 1
        }
      ]
    }
  ]
}

Response: 201
{
  "id": "uuid",
  "table_id": "uuid",
  "waiter_id": "uuid",
  "status": "draft",
  "placed_at": null,
  "meals": [
    {
      "id": "uuid",
      "course_number": 1,
      "mealItems": [
        {
          "id": "uuid",
          "menu_item_id": "uuid",
          "quantity": 2,
          "unit_price": "15.99",  // snapshot from MenuItem
          "special_instructions": "No onions, extra lemon",
          "status": "pending",
          "menuItem": { id, name, price, ... }
        }
      ]
    }
  ]
}
```

### Get Order Details
```
GET /api/orders/:orderId
Authorization: Bearer <token>

Response: 200 (full order structure with meals, items, bill)
```

### Submit Order (draft → submitted)
```
POST /api/orders/:orderId/submit
Authorization: Bearer <token>
Authorization role: waiter

Response: 200 { id, status: "submitted", placed_at: "2024-04-20T18:45:00Z", ... }
```

### Update Order Status
```
PATCH /api/orders/:orderId/status
Authorization: Bearer <token>
Authorization role: chef, manager

{
  "status": "in_kitchen"  // valid: in_kitchen, ready, served, closed
}

Response: 200 { id, status, ... }
```

### Update Meal Item Status
```
PATCH /api/meal-items/:mealItemId/status
Authorization: Bearer <token>
Authorization role: chef

{
  "status": "ready"  // pending, preparing, ready, served
}

Response: 200 { id, menu_item_id, status, ... }
```

---

## Reservation Endpoints

### Create Reservation
```
POST /api/reservations
Content-Type: application/json
(No auth required for guest reservations)

{
  "branch_id": "uuid",
  "guestName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "555-5678",
  "party_size": 4,
  "scheduled_at": "2024-04-25T19:00:00Z",
  "notes": "Birthday celebration",
  "account_id": "uuid"  // optional, for registered guests
}

Response: 201
{
  "id": "uuid",
  "branch_id": "uuid",
  "guestName": "Jane Smith",
  "party_size": 4,
  "scheduled_at": "2024-04-25T19:00:00Z",
  "status": "pending",
  "table_id": null
}
```

### Get Reservations by Branch
```
GET /api/reservations/branch/:branchId?status=confirmed&dateRange={"start":"2024-04-01","end":"2024-04-30"}
Authorization: Bearer <token>

Response: 200 [{ id, guestName, party_size, scheduled_at, status, table_id, ... }]
```

### Get Upcoming Reservations (next 2 hours)
```
GET /api/reservations/branch/:branchId/upcoming?hoursAhead=2
Authorization: Bearer <token>

Response: 200 [{ ...reservation with table details }]
```

### Assign Table to Reservation
```
POST /api/reservations/:reservationId/assign-table
Authorization: Bearer <token>
Authorization role: receptionist, manager

{
  "table_id": "uuid"
}

Response: 200 { id, table_id, ... }
Validation: table.capacity >= reservation.party_size
```

### Update Reservation Status
```
PATCH /api/reservations/:reservationId/status
Authorization: Bearer <token>
Authorization role: receptionist, manager

{
  "status": "confirmed"  // pending, confirmed, seated, cancelled, no_show
}

Response: 200 { id, status, ... }
```

---

## Billing & Payment Endpoints

### Generate Bill
```
POST /api/bills
Authorization: Bearer <token>
Authorization role: waiter, manager

{
  "order_id": "uuid"
}

Response: 201
{
  "id": "uuid",
  "order_id": "uuid",
  "subtotal": "45.97",
  "tax": "4.60",
  "discount": "0.00",
  "total": "50.57",
  "currency": "USD",
  "status": "open",
  "paid_at": null,
  "payments": []
}
```

### Get Bill
```
GET /api/bills/:billId
Authorization: Bearer <token>

Response: 200 { id, subtotal, tax, discount, total, status, payments[] }
```

### Apply Discount to Bill
```
POST /api/bills/:billId/discount
Authorization: Bearer <token>
Authorization role: manager

{
  "discount_amount": "5.00"
}

Response: 200
{
  "id": "uuid",
  "subtotal": "45.97",
  "tax": "4.60",
  "discount": "5.00",
  "total": "45.57",
  "status": "open"
}
```

### Process Payment
```
POST /api/bills/:billId/payment
Authorization: Bearer <token>

{
  "method": "card",  // cash, card, mobile, comp
  "amount": "50.57"
}

Response: 200
{
  "bill": {
    "id": "uuid",
    "status": "paid",
    "paid_at": "2024-04-20T19:30:00Z",
    "total": "50.57"
  },
  "payment": {
    "id": "uuid",
    "bill_id": "uuid",
    "method": "card",
    "amount": "50.57",
    "status": "completed"
  }
}
```

---

## Notification Endpoints

### Get User Notifications
```
GET /api/notifications?unread=true
Authorization: Bearer <token>

Response: 200
[
  {
    "id": "uuid",
    "type": "order_update",
    "payload": { "order_id": "uuid", "new_status": "ready", "table_number": 5 },
    "is_read": false,
    "created_at": "2024-04-20T18:50:00Z"
  }
]
```

### Mark Notification as Read
```
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>

Response: 200 { id, is_read: true, read_at: "2024-04-20T18:52:00Z", ... }
```

### Mark All as Read
```
POST /api/notifications/mark-all-read
Authorization: Bearer <token>

Response: 200 { updated: 5 }
```

---

## Error Responses

All endpoints return errors in consistent format:

```
400 Bad Request
{
  "error": "Invalid account_type"
}

401 Unauthorized
{
  "error": "Invalid token"
}

403 Forbidden
{
  "error": "This action requires one of: manager, chef"
}

404 Not Found
{
  "error": "Table not found"
}

500 Internal Server Error
{
  "error": "Database connection failed"
}
```

---

## WebSocket Events (Socket.IO)

```javascript
// Client connection
socket.on('connect', () => console.log('Connected'))

// Table status changed
socket.on('table:status', (data) => {
  // { tableId, status, updatedAt }
})

// Order created
socket.on('order:created', (data) => {
  // { orderId, tableId, items[] }
})

// Order status changed
socket.on('order:status', (data) => {
  // { orderId, status, tableId }
})

// Bill paid
socket.on('bill:paid', (data) => {
  // { billId, orderId, totalAmount }
})

// New notification
socket.on('notification:new', (data) => {
  // { notificationId, type, payload }
})

// Menu updated
socket.on('menu:updated', (data) => {
  // { menuId, changes }
})
```

