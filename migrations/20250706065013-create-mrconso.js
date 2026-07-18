'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mrconso', {
      CODE: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      CODE2: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      STR: {
        type: Sequelize.CHAR(255),
        allowNull: true,
        defaultValue: null,
      },
      INPATIENT: {
        type: Sequelize.CHAR(23),
        allowNull: true,
        defaultValue: null,
      },
      OUTPATIENT: {
        type: Sequelize.CHAR(103),
        allowNull: true,
        defaultValue: null,
      },
      TTY: {
        type: Sequelize.CHAR(2),
        allowNull: false,
      },
      SAB: {
        type: Sequelize.CHAR(20),
        allowNull: false,
      },
      CUI: {
        type: Sequelize.CHAR(8),
        allowNull: false,
      },
      CHAPTER: {
        type: Sequelize.CHAR(2),
        allowNull: false,
      },
      S1: {
        type: Sequelize.CHAR(3),
        allowNull: true,
        defaultValue: null,
      },
      SEVERITY: {
        type: Sequelize.CHAR(1),
        allowNull: false,
      },
      CLASS: {
        type: Sequelize.CHAR(11),
        allowNull: true,
        defaultValue: null,
      },
      CBG_USE_IND: {
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
    await queryInterface.dropTable('mrconso');
  }
};
