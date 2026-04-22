const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { createServer } = require('http')
const { Server: SocketIO } = require('socket.io')

const config = require('./config')
const errorHandler = require('./middleware/errorHandler')
const sequelize = require('./config/database')
const WsGateway = require('./websocket/WsGateway')
const eventBus = require('./events/EventBus')
const NotificationService = require('./services/NotificationService')

// Import routes
const authRoutes = require('./routes/auth')
const tableRoutes = require('./routes/tables')
const orderRoutes = require('./routes/orders')
const reservationRoutes = require('./routes/reservations')
const menuRoutes = require('./routes/menu')
const paymentRoutes = require('./routes/payments')

/**
 * Create and configure Express app
 */
const createApp = () => {
  const app = express()

  // Trust proxy (for production deployment)
  app.set('trust proxy', 1)

  // Middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))
  app.use(cookieParser())
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  )

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date(),
      env: config.NODE_ENV,
    })
  })

  // API Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/tables', tableRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/reservations', reservationRoutes)
  app.use('/api/menus', menuRoutes)
  app.use('/api/payments', paymentRoutes)

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    })
  })

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}

/**
 * Create HTTP server with Socket.IO
 */
const setupServer = (app) => {
  const httpServer = createServer(app)

  const io = new SocketIO(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Initialize WebSocket gateway
  const wsGateway = new WsGateway(io)

  // Initialize notification service with EventBus
  const notificationService = new NotificationService(wsGateway, eventBus)

  // Store gateway and service on app for access in routes
  app.locals.wsGateway = wsGateway
  app.locals.notificationService = notificationService
  app.locals.eventBus = eventBus

  return { httpServer, io, wsGateway, notificationService }
}

/**
 * Initialize database and start server
 */
const start = async () => {
  try {
    // Validate config
    console.log(`✓ Config loaded for environment: ${config.NODE_ENV}`)

    // Create app
    const app = createApp()

    // Setup server with WebSocket
    const { httpServer, wsGateway, notificationService } = setupServer(app)

    // Sync database (use migrations in production)
    if (config.NODE_ENV !== 'production') {
      console.log('Syncing database...')
      await sequelize.sync({ alter: true })
      console.log('✓ Database synced')
    }

    // Start HTTP server
    const PORT = config.PORT
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ WebSocket namespace: /api/realtime`)
      console.log(`✓ CORS origin: ${config.CORS_ORIGIN}`)
    })

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`)
      httpServer.close(() => {
        console.log('HTTP server closed')
      })
      await sequelize.close()
      console.log('Database connection closed')
      process.exit(0)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    return { app, httpServer, wsGateway, notificationService }
  } catch (error) {
    console.error('❌ Failed to start server:')
    console.error(error)
    process.exit(1)
  }
}

module.exports = {
  createApp,
  setupServer,
  start,
}
