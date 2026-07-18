'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ai_diagnosis', 'is_selected', {
      type: Sequelize.BOOLEAN,
      after: 'reason',
      defaultValue: false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ai_diagnosis', 'is_selected')
  }
};
