const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message)

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    })
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: err.errors[0].path
    })
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
}

module.exports = errorHandler
