const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema(
  {
    systolic: { type: Number, min: 50, max: 260 },
    diastolic: { type: Number, min: 30, max: 160 },
    pulse: { type: Number, min: 20, max: 250 },
    temperature: { type: Number, min: 90, max: 110 },
    spo2: { type: Number, min: 50, max: 100 },
    bloodSugar: { type: Number, min: 20, max: 600 },
    weight: { type: Number, min: 1, max: 300 },
    recordedAt: { type: Date },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

module.exports = vitalsSchema;
