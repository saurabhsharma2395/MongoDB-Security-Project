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
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  grade: {
    type: String
  },
  score: {
    type: Number
  
  }});

const restaurantSchema = new mongoose.Schema({
  address: {
    building: {
      type: String
    },
    coord: {
      type: [Number]
    },
    street: {
      type: String
    },
    zipcode: {
      type: String
    },
    borough: {
      type: String
    }
  },
  cuisine: {
    type: String
  },
  grades: {
    type: [gradeSchema]
  },
  name: {
    type: String
  },
  restaurant_id: {
    type: String
  }
});

const restaurant = mongoose.model('restaurant', restaurantSchema);

module.exports = restaurant;