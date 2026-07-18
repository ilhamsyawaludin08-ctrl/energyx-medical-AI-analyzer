const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InaGrouper4SpecialGroups = sequelize.define('InaGrouper4SpecialGroups', {
  code: {
    type: DataTypes.CHAR(20),
    allowNull: false,
  },
  code_full: {
    type: DataTypes.CHAR(20),
    allowNull: false,
    primaryKey: true,
  },
  cmg_description: {
    type: DataTypes.CHAR(100),
    allowNull: false,
  },
  inacbg: {
    type: DataTypes.CHAR(20),
    allowNull: false,
    primaryKey: true,
  },
  diagnosa_list: {
    type: DataTypes.CHAR(255),
    allowNull: false,
  },
  procedure_list: {
    type: DataTypes.CHAR(255),
    allowNull: false,
  },
  cmg_type: {
    type: DataTypes.CHAR(25),
    allowNull: false,
  },
  ri: {
    type: DataTypes.CHAR(3),
    allowNull: false,
  },
  hg: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  hs: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  ha: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  hb: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  hc: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  hd: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  use_ind: {
    type: DataTypes.ENUM('0', '1'),
    allowNull: false,
    defaultValue: '1',
  },
}, {
  tableName: 'ina_grouper4_specialgroups',
  timestamps: false,
  freezeTableName: true,
});

module.exports = InaGrouper4SpecialGroups;
