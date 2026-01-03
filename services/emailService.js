// Email sending utilities for birthday notifications

const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// Configure transporter using environment credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Generate HTML payload for birthday email
const getBirthdayEmailHTML = (username) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <style>
      body { font-family: Arial, sans-serif; margin:0; padding:40px; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
      .container { max-width:600px; margin:0 auto; background:#fff; border-radius:20px; padding:40px; box-shadow:0 10px 40px rgba(0,0,0,0.2); }
      h1 { color:#667eea; text-align:center; font-size:2rem; }
      .message { color:#333; font-size:1rem; line-height:1.6; text-align:center; }
      .signature { text-align:center; color:#666; margin-top:30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Happy Birthday, ${username}!</h1>
      <div class="message">
        <p>Wishing you a wonderful day filled with joy and celebration.</p>
      </div>
      <div class="signature">
        <p>Best regards,</p>
        <p><strong>Birthday Reminder App Team</strong></p>
      </div>
    </div>
  </body>
  </html>`;

// Send a birthday email to the specified recipient
const sendBirthdayEmail = async (email, username) => {
  try {
    logger.info("Preparing birthday email", { to: email, username });

    const mailOptions = {
      from: `"Birthday Reminder" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Happy Birthday, ${username}!`,
      html: getBirthdayEmailHTML(username),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success("Birthday email sent", {
      to: email,
      messageId: info.messageId,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Failed to send birthday email", {
      to: email,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

// Send a diagnostic/test email to verify configuration
const sendTestEmail = async () => {
  try {
    logger.info("Sending test email");
    const mailOptions = {
      from: `"Birthday App Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email - Birthday App",
      html: getBirthdayEmailHTML("Test User"),
    };
    await transporter.sendMail(mailOptions);
    logger.success("Test email sent successfully");
    return true;
  } catch (error) {
    logger.error("Failed to send test email", { error: error.message });
    return false;
  }
};

module.exports = { sendBirthdayEmail, sendTestEmail };
