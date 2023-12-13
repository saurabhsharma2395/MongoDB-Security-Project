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
require("dotenv").config({ path: "./config/.env" });
const cookieParser = require('cookie-parser');
const exphbs = require("express-handlebars");
const jwt = require('jsonwebtoken');
const graphqlHTTP = require('./routes/graphql');

// Import routes
var restaurantRoutesCLI = require('./routes/restaurantsCLI');
var restaurantRoutes = require('./routes/restaurants');
var loginRoutes = require('./routes/login');

// db initialization
const db = require('./config/db');

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Handlebars setup
const HBS = exphbs.create({
  helpers: {
    isArray: value => Array.isArray(value),
    json: context => JSON.stringify(context),
    concat: function() {
      const args = Array.from(arguments);
      args.pop(); // Remove the Handlebars options object
      return args.join('');
    },
    setVar: function(name, value, options) {
      options.data.root[name] = value;
  }
  },
  defaultLayout: "main",
  extname: ".hbs"
});

app.engine(".hbs", HBS.engine);
app.set("view engine", "hbs");

// Initialize database
db.initialize();

// Use routes
app.use("/api/restaurantCLI", restaurantRoutesCLI);
app.use("/api/restaurant", restaurantRoutes);
app.use("/", loginRoutes);

app.use('/graphql', isLoggedIn, graphqlHTTP);

// Middleware function to test login state at all times
function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies['token']; // token is stored in a cookie named 'token'
    if (!token) {
      res.locals.isLoggedIn = false;
      return res.redirect('/login');
    } else {
      // Verify the token
      jwt.verify(token, process.env.TOKEN_KEY);
      res.locals.isLoggedIn = true;
    }
  } catch (err) {
    console.error(err);
    res.locals.isLoggedIn = false;
  }
  next();
}

// Apply isLoggedIn middleware to every request
//app.use(isLoggedIn);

// Define the index route
app.get("/", (req, res) => {
  res.render("index", { title: "Project - Restaurant" });
});

// Define the index route
app.get("/welcome", isLoggedIn, (req, res) => {
  res.render("index", { title: "Project - Restaurant" });
});

// Handle 404 errors
app.use("*", isLoggedIn, (req, res) => {
  res.render("error", { title: "Error", message: "Page Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
