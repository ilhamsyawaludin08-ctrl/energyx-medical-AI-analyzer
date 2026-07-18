const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AiSeverity = sequelize.define('AiSeverity', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    analysis_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    justification: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    checklist: {
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
    tableName: 'ai_severity',
});

module.exports = AiSeverity;
