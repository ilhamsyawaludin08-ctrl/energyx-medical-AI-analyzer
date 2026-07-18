'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diagnosis_master', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      disease_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      icd10_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      doctor_diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      claim: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      charset: 'utf8mb4',
      engine: 'InnoDB'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diagnosis_master');
  }
};