/******************************************************************************
*
 *  ITE5315 – Project 
 *  I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 *  No part of this assignment has been copied manually or electronically from any other source 
 *  (including web sites) or distributed to other students.
 *
 *	Name: Saurabh Sharma 	Student ID: N01543808	Date: December 03, 2023
 *
 ******************************************************************************/
var express = require("express");
var path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

var restaurant_routes = require('./routes/restaurants');
const db = require('./config/db');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const HBS = exphbs.create({
  //create customer helper
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

db.initialize();

//ROUTES
//Initialize handlebar as template engine
app.engine(".hbs", HBS.engine);
app.set("view engine", "hbs");

// Define a route to render the index page
app.get("/", (req, res) => {
  res.render("index", { title: "Project - Restaurant" }); // layout: false to use the raw HTML without additional layout
});

app.use("/restaurants", restaurant_routes)

app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Set constant for port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
