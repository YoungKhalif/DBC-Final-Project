const { start } = require('./app')

// Start the server
start().catch((error) => {
  console.error('❌ Failed to start server:', error)
  process.exit(1)
})
