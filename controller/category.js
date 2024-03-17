const { Category, Account, Image } = require("../models");
const { Op } = require("sequelize");

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;
  console.log(id);
  try {
    if (!name) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category name is required",
      });
    }

    const user = await Account.findOne({
      where: { id },
    });
    if (!user || !id) {
      return res.status(404).json({
        ok: false,
        status: 401,
        message: "Unauthorized",
      });
    }

    const existingCategory = await Category.findOne({
      where: { name },
    });
    if (existingCategory) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category name already exists",
      });
    }

    await Category.create({
      name,
    });
    return res.status(201).json({
      ok: true,
      status: 200,
      message: `Successfully created new category: ${name}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const category = await Category.findOne({
      where: { id },
    });

    const existingCategory = await Category.findOne({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category name already exists",
      });
    }

    if (!category) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Category not found",
      });
    }

    if (!name) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category name is required",
      });
    }

    if (category.name === name) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category name is the same",
      });
    }

    await Category.update(
      {
        name,
        description,
      },
      {
        where: { id },
      }
    );

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    Category.beforeDestroy();

    await Category.destroy({
      where: { id },
      paranoid: true,
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getAllCategories = async (req, res) => {
  const { categoryId } = req.params;
  try {
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
        },
      });
      if (!category) {
        return res.status(404).json({
          ok: false,
          status: 404,
          message: "Category not found",
        });
      }
      const imageCount = await Image.count({
        where: {
          categoryId: categoryId,
        },
      });
      return res.status(200).json({
        ok: true,
        status: 200,
        category,
        imageCount,
      });
    }

    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
    });

    const categoriesWithImageCount = await Promise.all(
      categories.map(async (category) => {
        const imageCount = await Image.count({
          where: {
            categoryId: category.id,
          },
        });
        return {
          ...category.toJSON(),
          imageCount,
        };
      })
    );

    return res.status(200).json({
      ok: true,
      status: 200,
      categories: categoriesWithImageCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOne({
      where: { id },
      attributes: ["id", "name", "description"],
    });
    return res.status(200).json({
      ok: true,
      status: 200,
      category,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getDeletedCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null,
        },
      },
      paranoid: false,
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

exports.restoreCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOne({
      paranoid: false,
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Category not found",
      });
    }

    await Category.restore({
      where: { id },
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Category restored successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};
