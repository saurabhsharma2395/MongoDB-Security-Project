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

// Validation rules for change password
const changePasswordValidationRules = [
    check('oldPassword').not().isEmpty().withMessage('Old password is required.'),
    check('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long.'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Confirm password does not match new password.');
        }
        return true;
    })
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

// Route to render the change password page
router.get("/change-password", (req, res) => {
    res.render("changepassword", { title: "Change Password" });
});

// Route to handle change password
router.post("/change-password", changePasswordValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach(error => {
            formattedErrors[error.param] = error.msg;
        });

        return res.render('changepassword', {
            title: "Change Password",
            errors: formattedErrors,
            formData: req.body
        });
    }

    const { oldPassword, newPassword } = req.body;

    try {
        // Replace with your user authentication logic
        // Assuming `req.user` contains the authenticated user's info
        const user = await UserModel.findById(req.user._id);
        if (!user || !await bcrypt.compare(oldPassword, user.password)) {
            return res.render('changepassword', {
                title: "Change Password",
                errors: { oldPassword: { msg: "Old password is incorrect." } }
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.redirect('/'); // or any other page
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
