const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const authValidator = require("../validator/auth.js");

router.get("/deleted", categoryController.getDeletedCategories);
router.get("/:categoryId?", categoryController.getAllCategories);
// router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  authValidator.validateToken,
  categoryController.createCategory
);

router.put(
  "/:id",
  authValidator.validateToken,
  categoryController.updateCategory
);

router.patch(
  "/:id",
  authValidator.validateToken,
  categoryController.restoreCategory
);

router.delete(
  "/:id",
  authValidator.validateToken,
  categoryController.deleteCategory
);

module.exports = router;
