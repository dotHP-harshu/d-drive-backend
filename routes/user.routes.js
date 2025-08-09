const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const { body, validationResult, cookie } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors, message: "Invalid input" });
    }
    const { email, username, password } = req.body;

    bcrypt.hash(password, 10, async (err, hash) => {
      try {
        const newUser = await userModel.create({
          email,
          username,
          password: hash,
        });
        res.status(400).json("User created successfully..");
      } catch (err) {
        res
          .status(400)
          .json({
            error: err.errorResponse,
            message: "User is already registered.",
          });
      }
    });
  }
);

router.post(
  "/login",
  body("email").trim().isEmail(),
  body("password").trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors, message: "Invalid input" });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User or password is not correct." });
    }

    const isMatch = bcrypt.compare(password, user.password);

    if(!isMatch){
       return res
         .status(400)
         .json({ message: "User or password is not correct." });
    }
    
    const token = jwt.sign({ email: user.email, userId:user._id }, process.env.SECRET_KEY);

    res.cookie("token", token)

    res
      .status(200)
      .json({
        token,
        user: { email: user.email, username: user.username },
        message: "Authentication completed",
      });
  }
);

module.exports = router;
