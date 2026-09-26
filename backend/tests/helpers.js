const os = require("os");
const path = require("path");

process.env.NODE_ENV = "test";
process.env.MONGO_URL = process.env.TEST_MONGO_URL || "mongodb://127.0.0.1:27017/arogya_sahayak_test";
process.env.UPLOAD_DIR = path.join(os.tmpdir(), "arogya-test-uploads");

const request = require("supertest");
const mongoose = require("mongoose");
const env = require("../src/config/env");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const createApp = require("../src/app");

const PASSWORD = "correct-horse-1";
const TINY_PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

async function startApp() {
  const connection = await connectDatabase(env.mongoUrl);
  await connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
  return createApp({ mongoClient: connection.getClient() });
}

async function stopApp() {
  await mongoose.connection.dropDatabase();
  await disconnectDatabase();
}

async function csrfToken(agent) {
  const res = await agent.get("/api/session");
  return res.body.csrfToken;
}

async function send(agent, method, url, body) {
  const token = await csrfToken(agent);
  const req = agent[method](url).set("X-CSRF-Token", token);
  return body === undefined ? req : req.send(body);
}

const ROLE_DETAILS = {
  patient: {},
  doctor: {
    doctor: { specialization: "general", qualification: "MBBS", licenseNumber: "PMC-1001", experienceYears: 5, consultationFee: 150 },
  },
  sahayak: { sahayak: { healthCenter: "Nabha PHC" } },
};

async function signup(app, { name, email, role = "patient", phone = "", extra = {} }) {
  const agent = request.agent(app);
  const res = await send(agent, "post", "/api/auth/signup", {
    name,
    email,
    password: PASSWORD,
    role,
    phone,
    ...ROLE_DETAILS[role],
    ...extra,
  });
  if (res.status !== 201) throw new Error(`Signup failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user };
}

const inMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000).toISOString();

module.exports = { request, startApp, stopApp, csrfToken, send, signup, inMinutes, PASSWORD, TINY_PDF };
