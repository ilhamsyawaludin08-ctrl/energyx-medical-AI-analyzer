'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ai_analysis', 'age', {
      type: Sequelize.INTEGER,
      after: 'patient_name',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'gender', {
      type: Sequelize.STRING,
      after: 'age',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'weight', {
      type: Sequelize.INTEGER,
      after: 'gender',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'subjective', {
      type: Sequelize.TEXT,
      after: 'weight',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'objective', {
      type: Sequelize.TEXT,
      after: 'subjective',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'assesment', {
      type: Sequelize.TEXT,
      after: 'objective',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'encounter_number', {
      type: Sequelize.STRING,
      after: 'assesment',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'doctor_code', {
      type: Sequelize.STRING,
      after: 'encounter_number',
      allowNull: true
    });

    await queryInterface.addColumn('ai_analysis', 'hospital_code', {
      type: Sequelize.STRING,
      after: 'doctor_code',
      allowNull: true
    });

    await queryInterface.addIndex('ai_analysis', ['encounter_number'], {
      name: 'idx_ai_analysis_encounter_number'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('ai_analysis', 'idx_ai_analysis_encounter_number');
    
    await queryInterface.removeColumn('ai_analysis', 'age')
    await queryInterface.removeColumn('ai_analysis', 'gender')
    await queryInterface.removeColumn('ai_analysis', 'weight')
    await queryInterface.removeColumn('ai_analysis', 'subjective')
    await queryInterface.removeColumn('ai_analysis', 'objective')
    await queryInterface.removeColumn('ai_analysis', 'assesment')
    await queryInterface.removeColumn('ai_analysis', 'encounter_number')
    await queryInterface.removeColumn('ai_analysis', 'doctor_code')
    await queryInterface.removeColumn('ai_analysis', 'hospital_code')
    
  }
};
