// Controller for handling birthday-related routes

const User = require("../models/User");
const logger = require("../utils/logger");
const { checkBirthdaysNow } = require("../services/cronService");

// Render the home page with the birthday submission form
exports.showHomePage = (req, res) => {
  logger.info("Home page requested");
  res.render("index", {
    title: "Birthday Reminder",
    error: null,
    success: null,
  });
};

// Handle submission of a new birthday entry
exports.addBirthday = async (req, res) => {
  try {
    const { username, email, dateOfBirth } = req.body;

    logger.info("Attempting to add new birthday", { username, email });

    if (!username || !email || !dateOfBirth) {
      logger.warn("Missing required fields");
      return res.render("index", {
        title: "Birthday Reminder",
        error: "Please fill in all fields!",
        success: null,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn("Email already exists", { email });
      return res.render("index", {
        title: "Birthday Reminder",
        error: "This email is already registered!",
        success: null,
      });
    }

    const user = new User({
      username,
      email: email.toLowerCase(),
      dateOfBirth: new Date(dateOfBirth),
    });
    await user.save();

    logger.success("Birthday added", {
      username,
      email,
      birthday: user.getFormattedBirthday(),
    });

    res.render("success", {
      title: "Success!",
      username,
      birthday: user.getFormattedBirthday(),
    });
  } catch (error) {
    logger.error("Error adding birthday", { error: error.message });
    res.render("index", {
      title: "Birthday Reminder",
      error: "Something went wrong. Please try again!",
      success: null,
    });
  }
};

// Return all stored birthdays as JSON
exports.getAllBirthdays = async (req, res) => {
  try {
    logger.info("Fetching all birthdays");
    const users = await User.find().sort({ dateOfBirth: 1 });

    res.json({
      success: true,
      count: users.length,
      birthdays: users.map((user) => ({
        username: user.username,
        email: user.email,
        birthday: user.getFormattedBirthday(),
        isBirthdayToday: user.isBirthdayToday(),
      })),
    });
  } catch (error) {
    logger.error("Error fetching birthdays", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch birthdays" });
  }
};

// Return birthdays occurring today
exports.getTodaysBirthdays = async (req, res) => {
  try {
    logger.info("Checking today's birthdays");
    const users = await User.find();
    const todaysBirthdays = users.filter((user) => user.isBirthdayToday());

    res.json({
      success: true,
      count: todaysBirthdays.length,
      birthdays: todaysBirthdays.map((user) => ({
        username: user.username,
        email: user.email,
        birthday: user.getFormattedBirthday(),
      })),
    });
  } catch (error) {
    logger.error("Error checking today's birthdays", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to check birthdays" });
  }
};

// Trigger an immediate birthday check (used for testing/manual runs)
exports.triggerBirthdayCheck = async (req, res) => {
  try {
    logger.info("Manual birthday check triggered");
    await checkBirthdaysNow();
    res.json({
      success: true,
      message: "Birthday check completed. See logs for details.",
    });
  } catch (error) {
    logger.error("Error during manual birthday check", {
      error: error.message,
    });
    res.status(500).json({ success: false, message: "Birthday check failed" });
  }
};
