'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ina_grouper4_specialgroups', {
      Code: {
        type: Sequelize.CHAR(20),
        allowNull: false,
      },
      Code_Full: {
        type: Sequelize.CHAR(20),
        allowNull: false,
        primaryKey: true,
      },
      CMG_Description: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      INACBG: {
        type: Sequelize.CHAR(20),
        allowNull: false,
        primaryKey: true,
      },
      Diagnosa_List: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      Procedure_List: {
        type: Sequelize.CHAR(255),
        allowNull: false,
      },
      CMG_Type: {
        type: Sequelize.CHAR(25),
        allowNull: false,
      },
      GroupCode: {
        type: Sequelize.CHAR(50),
        allowNull: false,
      },
      RI: {
        type: Sequelize.CHAR(3),
        allowNull: false,
      },
      HG: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: null,
      },
      HS: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: null,
      },
      HA: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
        defaultValue: null,
      },
      HB: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: null,
      },
      HC: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
        defaultValue: null,
      },
      HD: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
        defaultValue: null,
      },
      use_ind: {
        type: Sequelize.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '1',
      },
    }, {
      charset: 'utf8mb3',
      collate: 'utf8mb3_general_ci',
      engine: 'MYISAM',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ina_grouper4_specialgroups');
  }
};
