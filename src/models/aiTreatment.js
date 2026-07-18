const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AiTreatment = sequelize.define('AiTreatment', {
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
    code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_ai_recommendation: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    confidence: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    inacbg: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cost: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    inacbg_list: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: 'ai_treatments',
});

module.exports = AiTreatment;
