'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {
      Store.hasMany(models.Receipt)
    }
  };
  Store.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    gstReg: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Store',
  });
  return Store;
};