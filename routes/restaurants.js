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
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const books = require("../models/restaurant");

// Middleware for error handling
const handleAsyncErrors = (handler) => (req, res, next) => handler(req, res, next).catch(next);

// Route to add a new restaurant
router.post(
  "/",
  handleAsyncErrors(async (req, res) => {
    const result = await restaurantModule.addNewRestaurant(req.body);
    res.status(201).json(result);
  })
);

// Route to get all restaurants
router.get(
  "/",
  handleAsyncErrors(async (req, res) => {
    const { page, perPage, borough } = req.query;
    const result = await restaurantModule.getAllRestaurants(page, perPage, borough);
    res.json(result);
  })
);

// Route to get a restaurant by ID
router.get(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    const result = await restaurantModule.getRestaurantById(req.params.id);
    res.json(result);
  })
);

// Route to update a restaurant by ID
router.put(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    const result = await restaurantModule.updateRestaurantById(req.body, req.params.id);
    res.json(result);
  })
);

// Route to delete a restaurant by ID
router.delete(
  "/:id",
  handleAsyncErrors(async (req, res) => {
    const result = await restaurantModule.deleteRestaurantById(req.params.id);
    res.json(result);
  })
);

module.exports = router;
