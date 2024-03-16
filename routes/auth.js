const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const authValidator = require("../validator/auth.js");

router.post("/", authController.loginHandler);
router.get("/", authValidator.validateToken, authController.getUserProfile);

module.exports = router;
