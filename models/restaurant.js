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
    type: Date,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
});

const restaurantSchema = new mongoose.Schema({
  address: {
    building: {
      type: String,
      required: true
    },
    coord: {
      type: [Number],
      required: true
    },
    street: {
      type: String,
      required: true
    },
    zipcode: {
      type: String,
      required: true
    },
    borough: {
      type: String,
      required: true
    }
  },
  cuisine: {
    type: String,
    required: true
  },
  grades: {
    type: [gradeSchema],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  restaurant_id: {
    type: String,
    required: true
  }
});

const restaurant = mongoose.model('restaurant', restaurantSchema);

module.exports = restaurant;