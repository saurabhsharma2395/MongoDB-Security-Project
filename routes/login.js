const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require("../models/user");

// Route to render the registration page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send("All input is required");
    }

    const oldUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (oldUser) {
      return res.status(409).send("User Already Exists. Please Login");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword
    });

    const token = jwt.sign({ user_id: user._id, email }, process.env.TOKEN_KEY, { expiresIn: "2h" });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { title: "Error", message: "Internal Server Error" });
  }
});

// Route to render the login page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ user_id: user._id, email }, process.env.TOKEN_KEY, { expiresIn: "2h" });
      res.cookie("token", token, { httpOnly: true });
      res.redirect("/");
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { title: "Error", message: "Internal Server Error" });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
