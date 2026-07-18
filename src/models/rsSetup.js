const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RsSetup = sequelize.define('RsSetup', {
    rs_no: {
        type: DataTypes.CHAR(15),
        allowNull: false,
        primaryKey: true
    },
    rs_name: {
        type: DataTypes.CHAR(255),
        allowNull: false
    },
    rs_class: {
        type: DataTypes.CHAR(10),
        allowNull: false
    },
    rs_tariff: {
        type: DataTypes.CHAR(100),
        allowNull: false
    },
    rs_tariff2: {
        type: DataTypes.CHAR(50),
        allowNull: false
    },
    rs_alamat: {
        type: DataTypes.CHAR(255),
        allowNull: false
    },
    rs_prop: {
        type: DataTypes.CHAR(255),
        allowNull: false
    },
    rs_kab: {
        type: DataTypes.CHAR(255),
        allowNull: false
    },
    regional: {
        type: DataTypes.STRING(4),
        allowNull: false
    },
    encryption_key: {
        type: DataTypes.CHAR(64),
        allowNull: false
    },
    vip_add_pct: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 0.0
    }
}, {
    timestamps: false,
    tableName: 'rs_setup',
    id: false 
});

module.exports = RsSetup;