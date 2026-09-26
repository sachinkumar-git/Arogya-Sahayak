const crypto = require("crypto");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const isTest = nodeEnv === "test";

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProduction) {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  sessionSecret = crypto.randomBytes(32).toString("hex");
  if (!isTest) {
    console.warn("[config] SESSION_SECRET is not set; using a temporary secret (sessions reset on restart).");
  }
}

module.exports = {
  nodeEnv,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 8080,
  mongoUrl: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/arogya_sahayak",
  sessionSecret,
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, "..", "..", "uploads"),
  videoRoomBaseUrl: process.env.VIDEO_ROOM_BASE_URL || "https://meet.jit.si",
};
