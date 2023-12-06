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

 const express = require('express');
 const { query, validationResult } = require('express-validator');
 const mongoose = require('mongoose');
 const router = express.Router();
 const bodyParser = require('body-parser');
 const restaurants = require('../models/restaurant.js');
 
 router.use(bodyParser.json());
 
 // GET all restaurants with pagination and optional borough filtering
 router.get('/', [
     query('page').isInt({ min: 1 }).optional(),
     query('perPage').isInt({ min: 1 }).optional(),
     query('borough').isString().optional()
 ], async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
     }
 
     const page = parseInt(req.query.page) || 1;
     const perPage = parseInt(req.query.perPage) || 5;
     const borough = req.query.borough;
 
     let query = {};
     if (borough) {
         query.borough = borough;
     }
 
     try {
         const restaurants_data = await restaurants.find(query)
             .skip((page - 1) * perPage)
             .limit(perPage)
             .lean();
         res.json(restaurants_data);
     } catch (err) {
         res.status(500).send(err.message);
     }
 });
 
 // GET a restaurant by _id
 router.get('/:id', async (req, res) => {
     try {
         const restaurantId = req.params.id;
         if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
             return res.status(400).send('Invalid ID format');
         }
 
         const restaurant = await restaurants.findById(restaurantId);
         if (!restaurant) {
             return res.status(404).send('Restaurant not found');
         }
         res.json(restaurant);
     } catch (err) {
         res.status(500).send(err.message);
     }
 });
 
 // POST a new restaurant
 router.post('/', async (req, res) => {
     try {
         const newRestaurant = new restaurants(req.body);
         await newRestaurant.save();
         res.status(201).json(newRestaurant);
     } catch (err) {
         res.status(500).send("Error adding new restaurant: " + err.message);
     }
 });
 
 // PUT update a restaurant by _id
 router.put('/:id', async (req, res) => {
     try {
         const restaurantId = req.params.id;
         const updateData = req.body;
         if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
             return res.status(400).send('Invalid ID format');
         }
 
         const updatedRestaurant = await restaurants.findByIdAndUpdate(
             restaurantId,
             updateData,
            { new: true, overwrite: true, runValidators: true }
         );
 
         if (!updatedRestaurant) {
             return res.status(404).send('Restaurant not found');
         }
 
         res.json(updatedRestaurant);
     } catch (err) {
         res.status(500).send("Error updating restaurant: " + err.message);
     }
 });
 
 // DELETE a restaurant by _id
 router.delete('/:id', async (req, res) => {
     try {
         const restaurantId = req.params.id;
         if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
             return res.status(400).send('Invalid ID format');
         }
 
         const deletedRestaurant = await restaurants.findByIdAndDelete(restaurantId);
         if (!deletedRestaurant) {
             return res.status(404).send('Restaurant not found');
         }
 
         res.send('Restaurant deleted successfully');
     } catch (err) {
         res.status(500).send("Error deleting restaurant: " + err.message);
     }
 });
 
 module.exports = router;
 