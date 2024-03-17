const { Image, Category, Account } = require("../models");
const { Sequelize, Op } = require("sequelize");
const path = require("path");
const sharp = require("sharp");

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
          message: `Category: ${categoryName} does not exist`,
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

exports.getImagesByCategoryId = async (req, res) => {
  const { categoryId } = req.params;
  const limit = parseInt(req.query.limit) || 0;
  const page = parseInt(req.query.page) || 1;
  const offset = limit * (page - 1);

  try {
    const category = await Category.findOne({
      where: { id: categoryId },
      attributes: ["name", "description", "id"],
      include: {
        model: Image,
        limit,
        offset,
      },
    });

    if (!category) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: `Category does not exist`,
      });
    }

    // Get the total count of images for the category
    const totalCount = await Image.count({ where: { categoryId } });

    return res.status(200).json({
      ok: true,
      status: 200,
      category: category.name,
      data: category,
      totalCount,
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

exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    await Image.destroy({
      where: { id },
      paranoid: true,
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Image deleted successfully",
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

exports.getDeletedImages = async (req, res) => {
  try {
    const images = await Image.findAll({
      where: {
        deletedAt: {
          [Op.ne]: null,
        },
        paranoid: false,
      },
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

exports.restoreDeletedImage = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.restore({
      where: { id },
    });

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Image restored successfully",
      data: image,
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
