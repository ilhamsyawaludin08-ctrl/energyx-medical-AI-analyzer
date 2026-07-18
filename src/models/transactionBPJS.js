const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransactionBpjs = sequelize.define('TransactionBpjs', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    patient_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    document_status: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    coverage_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    cost_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    profit_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'bpjs_transactions',
});

module.exports = TransactionBpjs;