const express = require("express");
const router = express.Router();
const imageController = require("../controller/image");
const { multerUpload } = require("../lib/multer");
const authValidator = require("../validator/auth");

router.get("/:categoryId", imageController.getImageByCategory);
router.get("/:categoryName", imageController.getImageByCategoryName);
router.get("/", imageController.getAllImage);

router.post(
  "/:categoryId?",
  multerUpload.array("images"),
  authValidator.validateToken,
  imageController.uploadHandler
);

module.exports = router;
