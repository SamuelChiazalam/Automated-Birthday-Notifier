// Scheduled and manual birthday checking service

const cron = require("node-cron");
const User = require("../models/User");
const { sendBirthdayEmail } = require("./emailService");
const logger = require("../utils/logger");

// Scan users and send birthday emails for those with birthdays today
const checkBirthdays = async () => {
  try {
    logger.info("Birthday check started", { time: new Date().toISOString() });
    const users = await User.find();

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const user of users) {
      if (user.isBirthdayToday()) {
        logger.info("Birthday detected", {
          username: user.username,
          email: user.email,
          birthday: user.getFormattedBirthday(),
        });

        const result = await sendBirthdayEmail(user.email, user.username);
        if (result.success) emailsSent++;
        else emailsFailed++;

        // Throttle outbound emails to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    logger.success("Birthday check completed", {
      totalUsers: users.length,
      emailsSent,
      emailsFailed,
    });
  } catch (error) {
    logger.error("Error during birthday check", { error: error.message });
  }
};

// Schedule the daily cron job at 07:00 server time
const startBirthdayReminder = () => {
  cron.schedule("0 7 * * *", () => {
    logger.info("Cron triggered: executing birthday check");
    checkBirthdays();
  });

  logger.success("Birthday reminder cron job started (daily at 07:00)");
};

// Manual trigger to run the birthday check immediately
const checkBirthdaysNow = async () => {
  logger.info("Manual birthday check requested");
  await checkBirthdays();
};

module.exports = { startBirthdayReminder, checkBirthdaysNow };
