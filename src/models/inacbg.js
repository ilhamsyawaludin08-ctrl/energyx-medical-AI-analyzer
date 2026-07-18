const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inacbg = sequelize.define('Inacbg', {
  inacbg: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  description_original: {
    type: DataTypes.CHAR(100),
    allowNull: false,
  },
  d2: {
    type: DataTypes.CHAR(10),
    allowNull: false,
  },
  deskripsi_inggris: {
    type: DataTypes.CHAR(100),
    allowNull: false,
  },
  d3: {
    type: DataTypes.CHAR(10),
    allowNull: false,
  },
  severity: {
    type: DataTypes.CHAR(10),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.CHAR(100),
    allowNull: false,
  },
  deskripsi_pmk_59_2014: {
    type: DataTypes.CHAR(110),
    allowNull: false,
  },
}, {
  tableName: 'inacbg',
  timestamps: false,
  freezeTableName: true,
});

module.exports = Inacbg;
