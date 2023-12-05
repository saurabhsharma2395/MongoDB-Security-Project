/******************************************************************************
*
*  ITE5315 – Project 
*  I declare that this assignment is my own work in accordance with Humber Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including web sites) or distributed to other students.
*
*  Name: Saurabh Sharma     Student ID: N01543808   Date: December 03, 2023
*
******************************************************************************/

var express = require("express");
var path = require("path");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

// Import routes
var restaurantRoutesCLI = require('./routes/restaurantsCLI');
var restaurantRoutes = require('./routes/restaurants');
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

// Define a route to render the index page
app.get("/", (req, res) => {
  res.render("index", { title: "Project - Restaurant" });
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
