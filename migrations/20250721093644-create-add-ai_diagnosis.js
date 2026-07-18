'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = [
      { name: 'inacbg', type: Sequelize.STRING },
      { name: 'cost', type: Sequelize.STRING },
      { name: 'inacbg_list', type: Sequelize.TEXT },
    ];

    for (const column of columns) {
      await queryInterface.addColumn('ai_diagnosis', column.name, {
        type: column.type,
        allowNull: true,
        after: 'is_selected',
      });
    }
  },

  async down(queryInterface) {
    const columnNames = [
      'inacbg',
      'cost',
      'inacbg_list',
    ];

    for (const name of columnNames) {
      await queryInterface.removeColumn('ai_diagnosis', name);
    }
  }
};
