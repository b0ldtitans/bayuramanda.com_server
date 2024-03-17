const express = require("express");
const router = express.Router();
const imageController = require("../controller/image");
const { multerUpload } = require("../lib/multer");
const authValidator = require("../validator/auth");

router.get("/category/:categoryId", imageController.getImagesByCategoryId);
router.get(
  "/deleted",
  authValidator.validateToken,
  imageController.getDeletedImages
);

router.get("/:imageId?", imageController.getAllImage);

router.patch(
  "/:id",
  authValidator.validateToken,
  imageController.restoreDeletedImage
);

router.delete("/:id", authValidator.validateToken, imageController.deleteImage);

router.post(
  "/:categoryId?",
  multerUpload.array("images"),
  authValidator.validateToken,
  imageController.uploadHandler
);

module.exports = router;
