const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const UserModel = require("../models/user");

// Validation rules for registration
const registerValidationRules = [
    check("first_name").not().isEmpty().withMessage("First name is required."),
    check("last_name").not().isEmpty().withMessage("Last name is required."),
    check("email").isEmail().withMessage("Please include a valid email."),
    check("password").isLength({ min: 6 }).withMessage("Please enter a password with 6 or more characters.")
];

// Validation rules for login
const loginValidationRules = [
    check("email").isEmail().withMessage("Please include a valid email."),
    check("password").not().isEmpty().withMessage("Password is required.")
];

// Route to render the registration page
router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

router.post("/register", registerValidationRules, async (req, res) => {
    const errors_list = validationResult(req);
    if (!errors_list.isEmpty()) {
        const formattedErrors ={};
        errors_list.array().forEach((error) => {
            formattedErrors[error.path] = error.msg;
        });
        console.log(formattedErrors);
        return res.render('register', {
            title: "Register",
            errors: formattedErrors,
            formData: req.body
        });
        
    }

    const { first_name, last_name, email, password } = req.body;
    try {
        const oldUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (oldUser) {

            return res.render('register', {
                title: "Register",
                errors: { email: "User Already Exists. Please Login" },
                formData: req.body
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        const token = jwt.sign({ user_id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "2h" });
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

router.post("/login", loginValidationRules, async (req, res) => {
    const errors_list = validationResult(req);
    if (!errors_list.isEmpty()) {
        const formattedErrors ={};
        errors_list.array().forEach((error) => {
            formattedErrors[error.path] = error.msg;
        });

        return res.render('login', {
            title: "Login",
            errors: formattedErrors,
            formData: req.body
        });
    }

    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ user_id: user._id, email }, process.env.JWT_SECRET, { expiresIn: "2h" });
            res.cookie("token", token, { httpOnly: true });
            res.redirect("/");
        } else {
            res.render('login', {
                title: "Login",
                errors: { password: { msg: "Invalid Credentials" } },
                formData: req.body
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { title: "Error", message: "Internal Server Error" });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router;
