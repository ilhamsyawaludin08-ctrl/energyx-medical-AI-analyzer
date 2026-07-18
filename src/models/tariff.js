const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tariff = sequelize.define('Tariff', {
    inacbg: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        primaryKey: true
    },
    regional: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        primaryKey: true
    },
    kode_tariff: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        primaryKey: true
    },
    kelas_rawat: {
        type: DataTypes.CHAR(10),
        allowNull: false,
        primaryKey: true
    },
    jenis_pelayanan: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    tariff_original: {
        type: DataTypes.CHAR(30),
        allowNull: false
    },
    tariff: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    tableName: 'tariff',
    id: false
});

module.exports = Tariff;