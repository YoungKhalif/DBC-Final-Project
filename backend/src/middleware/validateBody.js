const { ValidationError } = require('../utils/errors')

/**
 * Middleware factory for request body validation using Zod schemas
 * Usage: router.post('/path', validateBody(createUserSchema), controller)
 */
const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body)
      req.validatedBody = validated
      next()
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        }))
        throw new ValidationError('Invalid request body', errors)
      }
      throw error
    }
  }
}

module.exports = validateBody
