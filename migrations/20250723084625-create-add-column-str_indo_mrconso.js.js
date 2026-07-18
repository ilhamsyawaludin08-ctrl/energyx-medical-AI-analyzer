'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('mrconso', 'str_indo', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'str',
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('str_indo', 'mrconso');
  }
};
