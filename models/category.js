"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.Image, {
        foreignKey: "categoryId",
        onDelete: "SET NULL",
        hooks: true,
      });
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "Category",
    },
    {
      hooks: {
        beforeDelete: async (instance, options) => {
          if (options.force) {
            await instance
              .getImages({ force: true })
              .then((images) =>
                Promise.all(
                  images.map((image) => image.update({ categoryId: null }))
                )
              );
          }
        },
      },
    }
  );
  return Category;
};
