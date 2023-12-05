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
 const mongoose = require("mongoose");
 const bodyParser = require('body-parser');
 const restaurants = require('../models/restaurant.js'); // Assuming you have a separate module for database operations
 
 // Middleware to handle JSON requests
 router.use(bodyParser.json());
 
 
 // Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants_data = await restaurants.find().lean();
        res.render('display', { restaurants_data });
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).send('Error fetching restaurants: ' + err.message);
    }
});

router.get('/addRestaurant', async (req, res) => {
    res.render('insert_restaurant');
});

router.post('/restaurants', async (req, res) => {
    try {
        console.log("Received data:", req.body); // Add this line to log received data
        const newRestaurant = new restaurants({
            _id: new mongoose.Types.ObjectId(),
            ...req.body
        });
        await newRestaurant.save();
        console.log("ADDED SUCCESSFULLY");
        res.redirect('/');
    } catch (err) {
        console.error("Error saving new restaurant: ", err);
        res.status(500).send('Failed to add new restaurant');
    }
});
// Render form to update restaurant data
router.get('/updateRestaurant', async (req, res) => {
    res.render('search');
});

// Find a restaurant by a unique identifier (e.g., ID)
router.get('/find', async (req, res) => {
    try {
        const id = req.query.id;
        console.log("Received data:", req.body);
        const restaurant = await restaurants.findOne({ _id: id }).lean();
        if (!restaurant) {
            return res.status(404).send('Restaurant not found');
        }
        res.render('restaurantDetail', { restaurant });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error searching restaurant');
    }
});

// Update a restaurant by ID
router.post('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        console.log("Received data:", updatedData);
        const updatedRestaurant = await restaurants.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedRestaurant) {
            return res.status(404).send('Restaurant not found');
        }

        res.redirect('/'); // Redirect to a confirmation page or back to the details page
    } catch (err) {
        console.error("Error in updating restaurant:", err);
        res.status(500).send('Error updating restaurant');
    }
});

 module.exports = router;