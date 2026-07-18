'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tariff', {
      inacbg: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true
      },
      regional: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true
      },
      kode_tariff: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true
      },
      kelas_rawat: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true
      },
      jenis_pelayanan: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      tariff_original: {
        type: Sequelize.CHAR(30),
        allowNull: false,
      },
      tariff: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      }
    }, {
      charset: 'utf8mb4',
      engine: 'InnoDB'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tariff');
  }
};