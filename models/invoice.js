'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Tag)
      Invoice.belongsTo(models.User)
    }
  };
  Invoice.init({
    UserId: DataTypes.INTEGER,
    TagId: DataTypes.INTEGER,
    number: DataTypes.STRING,
    date: DataTypes.DATE,
    amount: DataTypes.DECIMAL,
    sellerNumber: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};