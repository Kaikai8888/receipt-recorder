'use strict';
const paymentTypes = require('../docs/payment_types.json')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Receipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Users',
          key: 'id'
        }
      },
      StoreId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Stores',
          key: 'id',
        }
      },
      payment: {
        type: Sequelize.STRING,
        allowNull: false,
        isIn: [paymentTypes]
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      tender: {
        type: Sequelize.DECIMAL(10, 2)
      },
      change: {
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Receipts');
  }
};