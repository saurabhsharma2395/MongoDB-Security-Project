/******************************************************************************
 *
 *	ITE5315 – Assignment 4
 *	I declare that this assignment is my own work in accordance with Humber Academic Policy.
 *	No part of this assignment has been copied manually or electronically from any other source
 *	(including web sites) or distributed to other students.
 *
 *	Name: Saurabh Sharma 	Student ID: N01543808	Date: November 27, 2023
 *
 *
 ******************************************************************************/
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const books = require("../models/restaurant");



module.exports = router;
