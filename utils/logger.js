// Simple file-based logger with timestamped entries

const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logFile = path.join(logsDir, "app.log");

const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  const dataString = Object.keys(data).length > 0 ? JSON.stringify(data) : "";
  return `[${timestamp}] [${level}] ${message} ${dataString}\n`;
};

const writeLog = (level, message, data = {}) => {
  const logMessage = formatLog(level, message, data);
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error("Could not write to log file:", err);
  });
  if (process.env.NODE_ENV === "development") console.log(logMessage.trim());
};

const logger = {
  info: (message, data = {}) => writeLog("INFO", message, data),
  warn: (message, data = {}) => writeLog("WARN", message, data),
  error: (message, data = {}) => writeLog("ERROR", message, data),
  success: (message, data = {}) => writeLog("SUCCESS", message, data),
};

module.exports = logger;
