require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DRIVER || 'mysql',
    port: process.env.DB_PORT
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'sim_db_test',
    host: process.env.DB_HOST,
    dialect: process.env.DB_DRIVER || 'mysql',
    port: process.env.DB_PORT
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DRIVER || 'mysql',
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: false
      }
    }
  }
};