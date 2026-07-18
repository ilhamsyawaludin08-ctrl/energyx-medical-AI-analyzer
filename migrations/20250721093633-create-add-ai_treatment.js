'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = [
      { name: 'inacbg_list', type: Sequelize.TEXT },
    ];

    for (const column of columns) {
      await queryInterface.addColumn('ai_treatments', column.name, {
        type: column.type,
        allowNull: true,
        after: 'is_selected',
      });
    }
  },

  async down(queryInterface) {
    const columnNames = [
      'inacbg_list'
    ];

    for (const name of columnNames) {
      await queryInterface.removeColumn('ai_treatments', name);
    }
  }
};
