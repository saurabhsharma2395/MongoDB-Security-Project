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
const mongoose = require('mongoose');
require("dotenv").config({ path: "./config/.env" });

class Database {
    constructor() {
      this.connectionString = process.env.URL;
    }
  
    async initialize() {
      try {
        await mongoose.connect(this.connectionString);
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('DB Error:', error.message);
      }
    }
  }
  
  module.exports = new Database();