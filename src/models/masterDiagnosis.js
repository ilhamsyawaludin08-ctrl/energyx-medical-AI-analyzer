const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterDiagnosis = sequelize.define('MasterDiagnosis', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    disease_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    icd10_code: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    doctor_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    claim: {
        type: DataTypes.DECIMAL(15, 2),
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
    tableName: 'diagnosis_master',
});

module.exports = MasterDiagnosis;
