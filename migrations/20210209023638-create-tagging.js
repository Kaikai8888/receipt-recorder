'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Taggings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ReceiptId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Receipts',
          key: 'id',
        }
      },
      TagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Tags',
          key: 'id',
        }
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
    await queryInterface.dropTable('Taggings');
  }
};