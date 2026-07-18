const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialCmgTariff = sequelize.define('SpecialCmgTariff', {
  no: {
    type: DataTypes.CHAR(10),
    allowNull: false,
  },
  code: {
    type: DataTypes.CHAR(10),
    allowNull: false,
  },
  code_full: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  inacbg: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  regional: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  kode_tariff: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  tariff: {
    type: DataTypes.CHAR(30),
    allowNull: false,
  },
  coefficient: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  tableName: 'special_cmg_tariff',
  timestamps: false,
  freezeTableName: true,
});

module.exports = SpecialCmgTariff;
