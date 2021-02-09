'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      Tag.belongsTo(models.User)
      Tag.belongsToMany(models.Receipt, {
        through: models.Tagging,
        foreignKey: 'TagId',
        as: 'TaggedReceipts'
      })
    }
  };
  Tag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};