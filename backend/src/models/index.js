const sequelize = require('../config/database')
const initializeModels = require('./schemas')

// Initialize all models with associations
const models = initializeModels(sequelize)

// Export models and sequelize instance
module.exports = {
  sequelize,
  ...models
}

