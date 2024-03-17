const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const authValidator = require("../validator/auth.js");
const { multerUpload } = require("../lib/multer");

router.get("/verify", authValidator.verifyToken);
router.get("/", authValidator.validateToken, authController.getUserProfile);
router.post("/", authController.loginHandler);
router.put(
  "/",
  multerUpload.single("profilePicture"),
  authValidator.validateToken,
  authController.updateUserProfile
);

module.exports = router;
