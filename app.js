/******************************************************************************
 *
 *  ITE5315 – Project 
 *  I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 *  No part of this assignment has been copied manually or electronically from any other source 
 *  (including web sites) or distributed to other students.
 *
 *	Name: Saurabh Sharma & Taranjeet Singh 	Student ID: N01543808	Date: December 05, 2023
 *
******************************************************************************/

var express = require("express");
var path = require("path");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import routes
var restaurantRoutesCLI = require('./routes/restaurantsCLI');
var restaurantRoutes = require('./routes/restaurants');
const UserModel = require("./models/user");
const db = require('./config/db');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const HBS = exphbs.create({
  // Create custom helper
  helpers: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    json: function(context){
      return JSON.stringify(context);
    }
  },
  defaultLayout: "main",
  extname: ".hbs",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

// Initialize database
db.initialize();

// Initialize handlebars as template engine
app.engine(".hbs", HBS.engine);
app.set("view engine", "hbs");

// Use restaurant routes
app.use("/api/restaurantCLI", restaurantRoutesCLI);
app.use("/api/restaurant", restaurantRoutes);
function isLoggedIn(req) {
  try {
      const token = req.cookies['token']; // Assuming the token is stored in a cookie named 'token'
      if (!token) {
          return false;
      }

      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
  } catch (err) {
      return false;
  }
}
// Route to render the registration page
app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send("All input is required");
    }

    // Check if user already exists
    const oldUser = await UserModel.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await UserModel.create({
      _id: new mongoose.Types.ObjectId(),
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      {email },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );

    // Save user token
    user.token = token;

    // Return new user
    //res.status(201).json(user);
    console.log("Registation Successfull");
    res.redirect('/api/restaurant');
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
// Route to render the login page
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const oldUser = await UserModel.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    const token = jwt.sign({ email }, process.env.TOKEN_KEY, { expiresIn: "2h" });
    //res.status(200).json({ token, message: "Login successful" });
     res.redirect('/api/restaurant');
  } catch (error) {
    console.error(error); 
    res.status(500).send("Internal Server Error");
  }
});


// Define a route to render the index page
app.get("/", (req, res) => {
  // Check if user is logged in
  res.render("index", { title: "Project - Restaurant", isLoggedIn: isLoggedIn });
});
app.get('/logout', (req, res) => {
  // If using JWT stored in cookies
  res.cookie('token', '', { maxAge: 1 }); // Clear the token cookie

  // Redirect to the home page or login page
  res.redirect('/login');
});
// Handle 404 errors
app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Set constant for port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
