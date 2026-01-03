// Entry point: initialize Express application and services

// Imports
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/users");
const { startBirthdayReminder } = require("./services/cronService");
const logger = require("./utils/logger");

// Application setup
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.success("Connected to MongoDB successfully.✅");
    console.log("✅ Database connected");
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", { error: err.message });
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

// Register routes
app.use("/", userRoutes);

// Start scheduled tasks when not running tests
if (process.env.NODE_ENV !== "test") startBirthdayReminder();

// Start server when not running tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.success(`Server started on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Global error handlers: log and exit on unexpected errors
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection", { error: err.message });
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message });
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Export app for testing
module.exports = app;
