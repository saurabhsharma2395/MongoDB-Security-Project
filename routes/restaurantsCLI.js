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

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const restaurants = require('../models/restaurant.js'); // Assuming you have a separate module for database operations

// Middleware to handle JSON requests
router.use(bodyParser.json());


// Get all restaurants
router.get('/', async (req, res) => {
  try {
      const restaurants_data = await restaurants.find().lean();
      res.json(restaurants_data);
  } catch (err) {
      res.status(500).send(err.message);
  }
});


// Get a restaurant by restaurant_id
router.get('/:restaurant_id', async (req, res) => {
    try {
        const restaurantId = req.params.restaurant_id;
        const restaurant = await restaurants.findOne({ restaurant_id: restaurantId });
        if (!restaurant) {
            return res.status(404).send('Restaurant not found');
        }
        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Create a new restaurant
router.post('/', async (req, res) => {
    try {
        const restaurantData = req.body;
        const newRestaurant = new restaurants(restaurantData);

        await newRestaurant.save();

        res.status(201).json(newRestaurant);
    } catch (err) {
        console.error("Error adding new restaurant:", err.message);
        res.status(500).send("An error occurred while adding the new restaurant.");
    }
  });
  
router.put('/:restaurant_id', async (req, res) => {
    const restaurantId = req.params.restaurant_id;
    const updateData = req.body;

    try {
        // Find the restaurant by its ID and update it
        const updatedRestaurant = await restaurants.findOneAndUpdate(
            { restaurant_id: restaurantId }, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).send('Restaurant not found');
        }

        // Return the updated restaurant
        res.json(updatedRestaurant);
    } catch (err) {
        console.error('Error updating restaurant:', err);
        res.status(500).send(err.message);
    }
});

// DELETE route to delete a restaurant by restaurant_id
router.delete('/:restaurant_id', async (req, res) => {
    const restaurantId = req.params.restaurant_id;

    try {
        // Find the restaurant by its ID and delete it
        const deletedRestaurant = await restaurants.findOneAndDelete({ restaurant_id: restaurantId });

        if (!deletedRestaurant) {
            return res.status(404).send('Restaurant not found');
        }

        res.send('Restaurant deleted successfully');
    } catch (err) {
        console.error('Error deleting restaurant:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;