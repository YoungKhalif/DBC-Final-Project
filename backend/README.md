# Restaurant Management System - Backend

Backend implementation for the Restaurant Management System using Node.js, Express, Sequelize ORM, and PostgreSQL.

## Directory Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, errors, etc.)
│   ├── models/          # Sequelize ORM models
│   ├── routes/          # Express routes
│   ├── services/        # Business logic & design patterns
│   ├── utils/           # Utility functions (JWT, password hashing)
│   └── server.js        # Main server entry point
├── migrations/          # Database migrations
├── seeders/            # Database seeders
├── tests/              # Test suites
├── .env.example        # Environment variables template
├── .eslintrc.cjs       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js      # Jest configuration
└── package.json        # Dependencies
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure PostgreSQL connection in `.env`

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Database Setup

Initialize database:
```bash
npm run migrate
npm run seed
```

Undo migrations:
```bash
npm run migrate:undo
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Tables
- `GET /api/tables/branch/:branchId` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create table (manager only)
- `PUT /api/tables/:id` - Update table
- `PATCH /api/tables/:id/status` - Update table status
- `DELETE /api/tables/:id` - Delete table

### Orders
- `POST /api/orders` - Create order (waiter only)
- `GET /api/orders/:id` - Get order
- `GET /api/orders/table/:tableId` - Get table orders
- `GET /api/orders/status/:status` - Get orders by status (chef/manager)
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/item/:itemId/status` - Update item status (chef)

### Menu
- `GET /api/menu/branch/:branchId` - Get menus
- `GET /api/menu/:id` - Get menu
- `POST /api/menu` - Create menu (manager)
- `PUT /api/menu/:id` - Update menu
- `DELETE /api/menu/:id` - Delete menu
- Menu items and sections have similar CRUD endpoints

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation
- `GET /api/reservations/branch/:branchId` - Get branch reservations
- `PUT /api/reservations/:id` - Update reservation
- `PATCH /api/reservations/:id/status` - Update status
- `POST /api/reservations/:id/assign-table` - Assign table
- `DELETE /api/reservations/:id` - Cancel reservation

### Payments
- `POST /api/payments/bills` - Generate bill
- `GET /api/payments/bills/:id` - Get bill
- `GET /api/payments/bills/status/:status` - Get bills by status
- `POST /api/payments/bills/:id/pay` - Process payment
- `POST /api/payments/bills/:id/discount` - Apply discount
- `DELETE /api/payments/bills/:id` - Cancel bill

## Design Patterns Implemented

### Observer Pattern (Notifications)
NotificationService uses observer pattern for event-driven notifications:
- Subscribers can register callbacks
- Notifications trigger all subscribers
- Socket.IO integration for real-time updates

### State Pattern (Order Status)
OrderService implements state pattern for order status transitions:
- Validates allowed transitions between states
- Prevents invalid state changes
- Enforces workflow: pending → confirmed → preparing → ready → served

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting & Formatting

Check linting issues:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## Database Schema

All 13 entities with relationships:
- **Account** - Users (waiter, chef, receptionist, manager)
- **Restaurant** - Restaurant entity
- **Branch** - Restaurant branches
- **Table** - Dining tables
- **Menu** - Menu management
- **MenuSection** - Menu categories
- **MenuItem** - Individual menu items
- **Order** - Customer orders
- **OrderItem** - Items in orders
- **Bill** - Order billing
- **Reservation** - Table reservations
- **Notification** - User notifications
- **Staff** - Staff assignments

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO 4.7
- **Testing**: Jest 29.7
- **Linting**: ESLint 8.55
- **Formatting**: Prettier 3.1

## Environment Variables

See `.env.example` for all required variables.

## Notes

- All passwords are hashed with bcryptjs
- JWT tokens expire after 7 days (configurable)
- Role-based access control implemented in middleware
- Status transitions enforced by services
- Relationships defined with foreign keys
