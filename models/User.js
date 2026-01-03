// User model: defines the schema and helper methods for stored users

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Returns true if the user's birthday falls on the current month/day
userSchema.methods.isBirthdayToday = function () {
  const today = new Date();
  const birthday = new Date(this.dateOfBirth);
  return (
    today.getMonth() === birthday.getMonth() &&
    today.getDate() === birthday.getDate()
  );
};

// Returns a human-friendly month/day string, e.g. "January 15"
userSchema.methods.getFormattedBirthday = function () {
  const birthday = new Date(this.dateOfBirth);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[birthday.getMonth()]} ${birthday.getDate()}`;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
