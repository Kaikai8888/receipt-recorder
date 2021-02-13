'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    static associate(models) {
      Receipt.belongsToMany(models.Tag, {
        through: models.Tagging,
        foreignKey: 'ReceiptId',
        as: 'Tags'
      })
      Receipt.belongsToMany(models.Product, {
        through: models.Purchase,
        foreignKey: 'ReceiptId',
        as: 'Products'
      })
      Receipt.belongsTo(models.Store)
      Receipt.hasMany(models.Tagging)
      Receipt.hasMany(models.Purchase)
    }
  };
  Receipt.init({
    UserId: DataTypes.INTEGER,
    StoreId: DataTypes.INTEGER,
    receiptNo: DataTypes.INTEGER,
    payment: DataTypes.STRING,
    date: DataTypes.DATE,
    tender: DataTypes.DECIMAL,
    change: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Receipt',
  });
  return Receipt;
};