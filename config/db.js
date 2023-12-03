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