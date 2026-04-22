require('dotenv').config()
const { z } = require('zod')
const { AppError } = require('../utils/errors')

// Config schema with Zod validation
const configSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().pipe(z.coerce.number().int().positive()).default('3000'),
  
  // Database
  DB_DIALECT: z.enum(['postgres', 'mysql', 'sqlite']).default('postgres'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().pipe(z.coerce.number().int().positive()).default('5432'),
  DB_NAME: z.string().default('rms_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

// Validate and load config at startup
let config
try {
  config = configSchema.parse(process.env)
  console.log(`✓ Config validated for environment: ${config.NODE_ENV}`)
} catch (error) {
  console.error('❌ Config validation failed:')
  console.error(error.errors)
  process.exit(1)
}

module.exports = config
