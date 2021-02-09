'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Receipt.init({
    UserId: DataTypes.INTEGER,
    StoreId: DataTypes.INTEGER,
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