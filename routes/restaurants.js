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
router.get('/find', async (req, res) => {
    res.render('search');
});


router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.var_InputText || '';
        console.log("Search Query:", searchQuery); // Confirming the search query

        // Check if the search query is empty
        if (!searchQuery.trim()) {
            console.log("Empty search query received");
            return res.status(400).render('searchResults', { 
                filter_restaurants: [],
                message: 'Search query is required'
            });
        }

        // Perform a case-insensitive search in the 'cuisine' field
        const regex = new RegExp(searchQuery, 'i');
        console.log("Regex used for search:", regex);

        const filter_restaurants = await restaurants.find({
            cuisine: regex
        }).lean();

        console.log("Number of restaurants found:", filter_restaurants.length);
        
 

        res.render('searchResults', { filter_restaurants });
    } catch (err) {
        console.error("Error in search: ", err);
        res.status(500).send('Error in search: ' + err.message);
    }
});

 module.exports = router;