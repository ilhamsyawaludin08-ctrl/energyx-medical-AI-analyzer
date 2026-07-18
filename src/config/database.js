require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DRIVER || 'mysql',
    logging: process.env.DB_LOGGING === 'true',
    timezone: '+07:00',
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
      freezeTableName: false,
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci'
      }
    },
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
  }
);


// module.exports = sequelize;
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
