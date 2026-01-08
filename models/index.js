require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'iskillbiz';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false
});

const db = {};
db.sequelize = sequelize;
db.User = require('./user')(sequelize);

async function initDatabase(sessionStore) {
  await sequelize.authenticate();
  if (sessionStore && typeof sessionStore.sync === 'function') {
    await sessionStore.sync();
  }
  await sequelize.sync();
}

module.exports = {
  ...db,
  initDatabase
};

