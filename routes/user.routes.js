const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Invalid input",
        errors,
      });
    }
    const { email, username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    try {
      const newUser = await userModel.create({
        email,
        username,
        password: hash,
      });
      const token = jwt.sign(
        { email: newUser.email, userId: newUser._id },
        process.env.SECRET_KEY
      );
      res.status(201).json({
        success: true,
        code: 201,
        data: {
          token,
          user: {
            email: newUser.email,
            username: newUser.username,
            userId: newUser._id,
          },
        },
        message: "User created successfully..",
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        code: 400,
        message: "User is already registered.",
      });
    }
  }
);

router.post(
  "/login",
  body("email").trim().isEmail(),
  body("password").trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Invalid input", success: false, code: 400 });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User or password is not correct.",
        success: false,
        code: 400,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "User or password is not correct.",
        success: false,
        code: 400,
      });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.SECRET_KEY
    );

    res.cookie("token", token);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Logged in successfully",
      data: {
        token,
        user: { email: user.email, username: user.username, userId: user._id },
      },
    });
  }
);

router.get("/me", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const user = await userModel.findById(userId);

  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "User not Found", code: 404 });

  res
    .status(200)
    .json({ data: { user, message: "User found" }, success: true, code: 200 });
});

router.get("/logout", authMiddleware, async (req, res) => {
  res.clearCookie("token");
  res
    .status(200)
    .json({ message: "Logged out successfully", success: true, code: 200 });
});

module.exports = router;
