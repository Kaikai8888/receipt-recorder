'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Receipt, {
        through: models.Purchase,
        foreignKey: 'ProductId',
        as: 'Receipt'
      })
    }
  };
  Product.init({
    productNo: DataTypes.BIGINT,
    StoreId: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product'
  });
  return Product;
};