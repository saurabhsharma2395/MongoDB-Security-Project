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

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const restaurants = require("../models/restaurant.js");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// Middleware to handle JSON requests
router.use(bodyParser.json());
const perPage = 12;

function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies["token"];
    if (!token) {
      res.locals.isLoggedIn = false;
      return res.redirect("/login"); // Redirect to login if not logged in
    } else {
      jwt.verify(token, process.env.TOKEN_KEY);
      res.locals.isLoggedIn = true;
    }
  } catch (err) {
    console.error(err);
    res.locals.isLoggedIn = false;
    return res.redirect("/login"); // Redirect to login on token verification error
  }
  next();
}

// Apply isLoggedIn middleware to all restaurant routes
router.use(isLoggedIn);

// Get all restaurants
const loadRestaurantsData = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Get the requested page number or default to 1

  try {
    const totalRestaurants = await restaurants.countDocuments();
    const totalPages = Math.ceil(totalRestaurants / perPage);

    if (page < 1 || page > totalPages) {
      return res.status(404).render("error", {
        title: "Error",
        message: "Page not found.",
      });
    }

    const restaurants_data = await restaurants
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    req.restaurantsData = restaurants_data;
    req.currentPage = page;
    req.totalPages = totalPages;

    next();
  } catch (err) {
    console.error("Error loading restaurant data.", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading restaurant data.",
    });
  }
};

// Routes
router.get("/", loadRestaurantsData, (req, res) => {
  if (req.xhr) {
    // AJAX request: send JSON
    res.json({
      restaurants_data: req.restaurantsData,
      currentPage: req.currentPage,
      totalPages: req.totalPages,
    });
  } else {
    // Normal request: render view
    res.render("display", {
      restaurants_data: req.restaurantsData,
      currentPage: req.currentPage,
      totalPages: req.totalPages,
    });
  }
});

router.get("/insert", async (req, res) => {
  res.render("insert_restaurant");
});

const restaurantValidationRules = [
  check("restaurant_id")
    .not()
    .isEmpty()
    .withMessage("Restaurant ID is required."),
  check("name").not().isEmpty().withMessage("Name is required."),
  check("building").not().isEmpty().withMessage("Building is required."),
  check("street").not().isEmpty().withMessage("Street is required."),
  check("zipcode").not().isEmpty().withMessage("Zipcode is required."),
  check("cuisine").not().isEmpty().withMessage("Cuisine is required."),
  check("borough").not().isEmpty().withMessage("Borough is required."),
  // Validation for grade fields
  check("grades.*.date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Grade date must be a valid date."),
  check("grades.*.grade")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("Grade is required."),
  check("grades.*.score")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Score must be a non-negative integer."),
];

router.post("/insert", restaurantValidationRules, async (req, res) => {
  const errors_list = validationResult(req);
  if (!errors_list.isEmpty()) {
    const formattedErrors = {};
    errors_list.array().forEach((error) => {
      const formattedPath = error.path
        .replace(/'\[/g, "[")
        .replace(/\]'/g, "]");
      formattedErrors[formattedPath] = error.msg;
    });
    console.log(formattedErrors);

    return res.status(400).render("insert_restaurant", {
      errors: formattedErrors,
      formData: req.body,
    });
  }
  try {
    console.log("Received data:", req.body);

    // Convert string coordinates to numbers
    if (req.body.address && req.body.address.coord) {
      req.body.address.coord = [
        parseFloat(req.body.address.coord[0]),
        parseFloat(req.body.address.coord[1]),
      ];
    }

    // Convert grades data
    if (req.body.grades) {
      req.body.grades = req.body.grades.map((grade) => ({
        date: grade.date ? new Date(grade.date) : null,
        grade: grade.grade,
        score: grade.score ? parseInt(grade.score) : null,
      }));
    }

    const newRestaurant = new restaurants({
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
    });

    await newRestaurant.save();
    console.log("ADDED SUCCESSFULLY");

    // Redirect to the searchResults page with the new restaurant
    return res.render("searchResults", {
      filter_restaurants: [newRestaurant.toObject()],
    });
  } catch (err) {
    console.error("Error saving new restaurant: ", err);

    // Render error page
    return res.status(500).render("error", {
      title: "Error",
      message: "Failed to add new restaurant. Error: " + err.message,
    });
  }
});

// Render form to find restaurant data
router.get("/find/:parameter", async (req, res) => {
  const searchType = req.params.parameter;
  res.render("search", { parameter: searchType });
});

const loadSearchData = async (req, res, next) => {
  const searchType = req.query.parameter;
  const searchQuery = req.query.var_InputText || "";
  const page = parseInt(req.query.page) || 1;

  try {
    // Ensure there is a search query
    if (!searchQuery.trim()) {
      return res.status(400).render("error", {
        title: "Error",
        message: "Search query is required.",
      });
    }

    // Build a case-insensitive regex search
    const regex = new RegExp(searchQuery, "i");
    const query = { [searchType]: regex };

    const totalResults = await restaurants.countDocuments(query);
    const totalPages = Math.ceil(totalResults / perPage);

    const filter_restaurants = await restaurants
      .find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    req.filterRestaurants = filter_restaurants;
    req.currentPage = page;
    req.totalPages = totalPages;

    next();
  } catch (err) {
    console.error("Error loading search data.", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading search data.",
    });
  }
};

router.get("/search", loadSearchData, (req, res) => {
  if (req.xhr) {
    // AJAX request: send JSON
    res.json({
      filter_restaurants: req.filterRestaurants,
      currentPage: req.currentPage,
      totalPages: req.totalPages,
    });
  } else {
    // Normal request: render view
    res.render("searchResults", {
      filter_restaurants: req.filterRestaurants,
      currentPage: req.currentPage,
      totalPages: req.totalPages,
      searchType: req.query.parameter,
      searchQuery: req.query.var_InputText,
    });
  }
});

router.get('/individual/:restaurant_id', async (req, res) => {
  try {
      const restaurantId = req.params.restaurant_id;
      const filter_restaurants = await restaurants.find({restaurant_id: restaurantId}).lean();
      if (!filter_restaurants) {
          return res.status(404).render('error', {
              title: "Error",
              message: "Restaurant not found."
          });
      }
      
      const offset = 0.001; // This value can be adjusted based on how zoomed in you want the map to be
      const latitude = filter_restaurants[0].address.coord[1];
      const longitude = filter_restaurants[0].address.coord[0];
  
      const boundingBox = {
          longitudeMinusOffset: longitude - offset,
          latitudeMinusOffset: latitude - offset,
          longitudePlusOffset: longitude + offset,
          latitudePlusOffset: latitude + offset
      };
  
      res.render('restaurantDetail', {
          title: 'Restaurant Details',
          restaurant_dat: filter_restaurants[0],
          ...boundingBox
      });
  } catch (err) {
      console.error("Error fetching restaurant details: ", err);
      res.status(500).render('error', {
          title: "Error",
          message: "Error fetching restaurant details."
      });
  }
});


module.exports = router;
