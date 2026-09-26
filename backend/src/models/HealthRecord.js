const mongoose = require("mongoose");
const vitalsSchema = require("./schemas/vitals");
const { RECORD_TYPES } = require("../constants/records");

const { ObjectId } = mongoose.Schema.Types;

const fileSchema = new mongoose.Schema(
  {
    storedName: { type: String, required: true },
    originalName: { type: String, required: true, maxlength: 200 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: ObjectId, ref: "User", required: true, index: true },
    consultation: { type: ObjectId, ref: "Consultation", default: null },
    type: { type: String, enum: RECORD_TYPES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, maxlength: 2000 },
    vitals: vitalsSchema,
    file: { type: fileSchema, select: false },
    hasFile: { type: Boolean, default: false },
    recordedBy: { type: ObjectId, ref: "User", required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

healthRecordSchema.index({ patient: 1, recordedAt: -1 });

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
