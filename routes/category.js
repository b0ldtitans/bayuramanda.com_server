const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category");
const authValidator = require("../validator/auth.js");

router.get("/:id", categoryController.getCategoryById);
router.get("/", categoryController.getAllCategories);

router.post(
  "/",
  authValidator.validateToken,
  categoryController.createCategory
);

router.patch(
  "/:id",
  authValidator.validateToken,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authValidator.validateToken,
  categoryController.deleteCategory
);

module.exports = router;
