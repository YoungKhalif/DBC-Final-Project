const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const socketIo = require('socket.io')
require('dotenv').config()

const sequelize = require('./config/database')
const errorHandler = require('./middleware/errorHandler')
const { authenticate } = require('./middleware/auth')

// Import routes
const authRoutes = require('./routes/auth')
const tableRoutes = require('./routes/tables')
const orderRoutes = require('./routes/orders')
const menuRoutes = require('./routes/menu')
const reservationRoutes = require('./routes/reservations')
const paymentRoutes = require('./routes/payments')

const app = express()
const httpServer = createServer(app)
const io = socketIo(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/payments', paymentRoutes)

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  // Table status updates
  socket.on('table:status', (data) => {
    io.emit('table:updated', data)
  })

  // Order updates
  socket.on('order:created', (data) => {
    io.emit('order:new', data)
  })

  socket.on('order:updated', (data) => {
    io.emit('order:changed', data)
  })

  // Notification events
  socket.on('notification:new', (data) => {
    io.emit('notification:received', data)
  })
})

// Error handling
app.use(errorHandler)

// Initialize database and start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate()
    console.log('✓ Database connection established')

    // Sync models (use migrations in production)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    console.log('✓ Database models synchronized')

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Socket.IO listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('✗ Failed to start server:', error.message)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...')
  await sequelize.close()
  process.exit(0)
})

startServer()

module.exports = { app, httpServer, io }
