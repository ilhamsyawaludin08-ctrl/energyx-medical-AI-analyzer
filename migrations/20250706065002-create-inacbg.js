'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inacbg', {
      INACBG: {
        type: Sequelize.CHAR(10),
        allowNull: false,
        primaryKey: true,
      },
      DESCRIPTION_ORIGINAL: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      D2: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      DESKRIPSI_INGGRIS: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      D3: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      SEVERITY: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      DESKRIPSI: {
        type: Sequelize.CHAR(100),
        allowNull: false,
      },
      DESKRIPSI_PMK_59_2014: {
        type: Sequelize.CHAR(110),
        allowNull: false,
      },
    }, {
      charset: 'utf8mb3',
      collate: 'utf8mb3_general_ci',
      engine: 'MYISAM',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inacbg');
  }
};
