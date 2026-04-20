# Restaurant Management System (RMS)

A comprehensive, full-stack Restaurant Management System built with React (Vite) frontend, Node.js/Express backend, and PostgreSQL database.

## Project Structure

```
DBC-Final-Project/
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/   # Atomic, molecular, and organism components
│   │   ├── pages/        # Page components for different features
│   │   ├── context/      # React Context providers
│   │   ├── hooks/        # Custom React hooks
│   │   └── services/     # API and Socket services
│   └── package.json
├── backend/              # Node.js/Express backend (coming soon)
└── README.md
```

## Features

### Current (Phase 1 & 4 - Frontend)
✅ Project structure and tooling setup  
✅ React + Vite development environment  
✅ Tailwind CSS for responsive styling  
✅ Component architecture (Atoms, Molecules, Organisms)  
✅ Authentication context with JWT support  
✅ Notification system context  
✅ Custom React hooks for API and real-time data  
✅ Socket.io integration for real-time updates  
✅ Page components for:
  - Login
  - Dashboard
  - Table Management
  - Menu Management
  - Order Management
  - Reservation Management
✅ Navigation layout with sidebar

### Upcoming (Phase 2, 3, 5, 6, 7 - Backend & Integration)
🔄 Backend API with Node.js/Express  
🔄 PostgreSQL database setup and models  
🔄 Authentication and authorization  
🔄 Real-time order and table status updates  
🔄 Payment processing integration  
🔄 Staff and inventory management  
🔄 Testing and deployment  

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### Backend (Coming Soon)

```bash
cd backend
npm install
npm run dev
```

## Architecture

### Design Patterns
- **Observer Pattern**: For the notification system (event-driven updates)
- **State Pattern**: For order status transitions (Pending → Preparing → Ready → Served → Paid)
- **Context API**: For global state management (Auth, Notifications)

### Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Axios, Socket.io-client
- **Backend**: Node.js, Express, PostgreSQL, Sequelize/Prisma (ORM)
- **Real-time**: Socket.io for live updates
- **Testing**: Jest, React Testing Library (backend), Cypress/Playwright (E2E)

## Development Workflow

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes following component architecture
3. Test locally: `npm run dev`
4. Commit with clear messages
5. Push and create pull request

## Component Structure

### Atoms
Small, reusable UI components:
- Button
- Input
- Badge
- Modal
- Card
- Spinner

### Molecules
Combinations of atoms:
- LoginForm
- TableCard
- MenuItemCard
- OrderItemRow

### Organisms
Complex components (future):
- OrderBoard
- ReservationBoard
- TableLayout

## API Integration

All API calls go through a centralized Axios client with:
- Automatic JWT token handling
- Request/response interceptors
- Base URL configuration via environment variables

## Real-time Updates

Socket.io is configured for:
- Table status updates
- Order progress notifications
- Reservation confirmations
- Waiter/Chef notifications

## Database Models (Phase 2)

Planned entities:
- Restaurant, Branch
- Menu, MenuSection, MenuItem
- Table, TableSeat
- Order, Meal, MealItem
- Bill
- Account (base class for actors)
- Staff, Reservation, Notification

## Contributing

Ensure code follows:
- Component-driven architecture
- Atomic design principles
- Tailwind CSS for styling
- Proper prop validation
- Clear, descriptive naming

## Next Steps

1. **Phase 1 (Complete)**: Project setup and tooling ✅
2. **Phase 2**: Database design and backend models
3. **Phase 3**: RESTful API development
4. **Phase 4 (In Progress)**: Frontend component architecture ✅
5. **Phase 5**: Feature implementation
6. **Phase 6**: Testing
7. **Phase 7**: Deployment

## License

MIT
