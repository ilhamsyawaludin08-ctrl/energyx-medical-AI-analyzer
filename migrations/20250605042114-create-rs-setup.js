'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('rs_setup', {
      rs_no: {
        type: Sequelize.CHAR(15),
        allowNull: false,
      },
      rs_name: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      rs_class: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      rs_tariff: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      rs_tariff2: {
        type: Sequelize.CHAR(50),
        allowNull: false,
      },
      rs_alamat: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      rs_prop: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      rs_kab: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      regional: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },
      encryption_key: {
        type: Sequelize.CHAR(64),
        allowNull: false,
      },
      vip_add_pct: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false,
        defaultValue: 0.0
      }
    }, {
      charset: 'utf8mb3',
      collate: 'utf8mb3_general_ci',
      engine: 'MyISAM'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('rs_setup');
  }
};