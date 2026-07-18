const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AiAnalysis = sequelize.define('AiAnalysis', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    patient_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patient_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    subjective: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    objective: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    assesment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    encounter_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    doctor_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hospital_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    condition_raw: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    response_raw: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    service_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: false,
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
    tableName: 'ai_analysis',
    indexes: [
        {
            name: 'idx_ai_analysis_encounter_number',
            fields: ['encounter_number']
        }
    ]
});

module.exports = AiAnalysis;
