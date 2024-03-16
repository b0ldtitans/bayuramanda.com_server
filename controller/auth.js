require("dotenv").config({
  path: (__dirname, "../.env"),
});
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { Account } = require("../models");

exports.loginHandler = async (req, res) => {
  const { user_identity, password, remember } = req.body;
  try {
    const user = await Account.findOne({
      where: {
        [Op.or]: [{ email: user_identity }, { username: user_identity }],
      },
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Invalid email/username or password",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Invalid email/username or password",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Login success",
      token,
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

exports.getUserProfile = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await Account.findByPk(id, {
      attributes: {
        include: ["id", "fullname", "email", "username", "profilePicture"],
        exclude: ["password"],
      },
    });
    return res.status(200).json({
      ok: true,
      status: 200,
      user,
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
