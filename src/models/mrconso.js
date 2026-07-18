const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mrconso = sequelize.define('Mrconso', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    code2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    str: {
        type: DataTypes.STRING,
        allowNull: true
    },
    str_indo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    inpatient: {
        type: DataTypes.STRING,
        allowNull: true
    },
    outpatient: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tty: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sab: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cui: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    chapter: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    s1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    severity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    class: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cbg_use_ind: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
    },
}, {
    tableName: 'mrconso',
    timestamps: false,
    freezeTableName: true,
});

module.exports = Mrconso;
