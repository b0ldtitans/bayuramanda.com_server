"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Image.belongsTo(models.Category, {
        foreignKey: "categoryId",
      });
    }
  }
  Image.init(
    {
      img: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alt: {
        type: DataTypes.STRING,
        defaultValue: "Photograph by Bayu Ramanda",
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Category",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Image",
    }
  );
  return Image;
};
