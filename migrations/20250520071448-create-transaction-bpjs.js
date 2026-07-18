'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bpjs_transactions', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            patient_name: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(150),
                allowNull: true
            },
            document_status: {
                type: Sequelize.STRING(150),
                allowNull: true
            },
            coverage_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            cost_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            profit_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
            },
            transaction_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            notes: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('bpjs_transactions');
    }
};