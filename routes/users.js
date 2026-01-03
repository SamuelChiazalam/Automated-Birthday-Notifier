// Route definitions for birthday-related endpoints

const express = require("express");
const router = express.Router();
const birthdayController = require("../controllers/birthdayController");

// Web pages
router.get("/", birthdayController.showHomePage);
router.post("/add-birthday", birthdayController.addBirthday);

// API endpoints
router.get("/api/birthdays", birthdayController.getAllBirthdays);
router.get("/api/birthdays/today", birthdayController.getTodaysBirthdays);
router.post("/api/check-birthdays", birthdayController.triggerBirthdayCheck);

module.exports = router;
