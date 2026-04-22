const config = require('./index')

/**
 * Simple logger - can be replaced with Winston or Pino
 */
const logger = {
  error: (data) => {
    if (['error', 'warn', 'info', 'debug'].includes(config.LOG_LEVEL)) {
      console.error('[ERROR]', JSON.stringify(data))
    }
  },

  warn: (data) => {
    if (['warn', 'info', 'debug'].includes(config.LOG_LEVEL)) {
      console.warn('[WARN]', JSON.stringify(data))
    }
  },

  info: (data) => {
    if (['info', 'debug'].includes(config.LOG_LEVEL)) {
      console.log('[INFO]', JSON.stringify(data))
    }
  },

  debug: (data) => {
    if (config.LOG_LEVEL === 'debug') {
      console.log('[DEBUG]', JSON.stringify(data))
    }
  },
}

module.exports = logger
