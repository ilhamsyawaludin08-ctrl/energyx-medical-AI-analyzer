const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransactionBpjsHasDiagnosis = sequelize.define('TransactionBpjsHasDiagnosis', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  transaction_bpjs_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'bpjs_transactions',
      key: 'id'
    }
  },
  diagnosis_master_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'diagnosis_master',
      key: 'id'
    }
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
    timestamps: true,
    tableName: 'transaction_bpjs_has_diagnosis',
});

module.exports = TransactionBpjsHasDiagnosis;