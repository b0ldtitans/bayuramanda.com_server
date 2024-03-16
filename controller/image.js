const { Image, Category } = require("../models");
const { Sequelize, Op } = require("sequelize");
const path = require("path");
const sharp = require("sharp");

exports.getImageByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findOne({
      where: {
        id: categoryId,
        deletedAt: {
          [Op.not]: null,
        },
      },
      attributes: ["name"],
      paranoid: false,
    });

    if (category) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category not found",
      });
    }

    const data = await Category.findAll({
      where: {
        id: categoryId,
      },
      attributes: ["name"],
    });

    const imageData = await Image.findAll({
      where: {
        categoryId: categoryId,
      },
      attributes: ["img", "alt"],
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      category: data[0].name,
      data: {
        imageData,
      },
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

exports.getImageByCategoryName = async (req, res) => {
  const { categoryName } = req.query.category;
  try {
    const category = await Category.findOne({
      where: {
        name: categoryName,
      },
      attributes: ["name", "id"],
      include: {
        model: Image,
        where: {
          categoryId: category.id,
        },
        attributes: ["img", "alt"],
      },
    });

    console.log(category);

    if (!category) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      ok: true,
      status: 200,
      category: data[0].name,
      data: category,
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

exports.getAllImage = async (req, res) => {
  const { categoryName } = req.query;

  try {
    if (categoryName) {
      const category = await Category.findOne({
        where: {
          name: categoryName,
        },
      });

      if (!category) {
        return res.status(400).json({
          ok: false,
          status: 400,
          message: `Category does not exist`,
        });
      }

      const images = await Image.findAll({
        where: {
          categoryId: category.id,
        },
      });

      return res.status(200).json({
        ok: true,
        status: 200,
        images,
      });
    }
    const images = await Image.findAll({
      attributes: ["id", "thumbnail", "img", "alt", "categoryId"],
      order: [Sequelize.literal("RAND()")],
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      images,
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

exports.uploadHandler = async (req, res) => {
  const images = req.files;
  const { categoryId } = req.params;
  const { captions } = req.body;
  const { id } = req.user;

  try {
    if (!id) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Unauthorized",
      });
    }
    const checkUser = await Account.findOne({
      where: {
        id,
      },
    });
    if (!checkUser) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Unauthorized",
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Images are required",
      });
    }
    const imageObjects = await Promise.all(
      images.map(async (image, index) => {
        if (categoryId) {
          const category = await Category.findOne({
            where: {
              id: categoryId,
            },
          });
          if (!category) {
            return res.status(400).json({
              ok: false,
              status: 400,
              message: `Category does not exist`,
            });
          }
        }

        const inputFile = image.path;

        const fileNameWithoutExtension = path.parse(image.filename).name;

        const thumbnailFileName = `${fileNameWithoutExtension}_thumbnail.webp`;
        const thumbnailFile = path.join(
          __dirname,
          "../public",
          thumbnailFileName
        );

        await sharp(inputFile).webp({ quality: 30 }).toFile(thumbnailFile);
        if (!captions) {
          return {
            img: image.filename,
            categoryId: categoryId,
            thumbnail: thumbnailFileName,
          };
        }
        return {
          img: image.filename,
          alt: captions,
          categoryId: categoryId,
          thumbnail: thumbnailFileName,
        };
      })
    );

    if (!imageObjects || imageObjects.length === 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "No valid images provided",
      });
    }

    const img = await Image.bulkCreate(imageObjects);

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Images successfully uploaded",
      data: img,
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
