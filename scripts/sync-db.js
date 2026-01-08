const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    // syncing with alter: true to update existing tables without dropping them
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
