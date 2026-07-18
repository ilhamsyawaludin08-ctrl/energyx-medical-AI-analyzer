'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('special_cmg_tariff', {
      NO: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      CODE: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      CODE_FULL: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      INACBG: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      REGIONAL: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      KODE_TARIFF: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      TARIFF: {
        type: Sequelize.CHAR(30),
        allowNull: false,
      },
      COEFFICIENT: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
    }, {
      charset: 'utf8mb3',
      collate: 'utf8mb3_general_ci',
      engine: 'MYISAM',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('special_cmg_tariff');
  }
};
