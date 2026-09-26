const Joi = require("joi");
const { SPECIALTY_KEYS } = require("../constants/consultations");
const { UPLOADABLE_RECORD_TYPES } = require("../constants/records");
const { text, optionalText, optional, nullable } = require("./common");

const medicineSearch = Joi.object({
  q: optional(Joi.string().trim().max(60), ""),
});

const doctorSearch = Joi.object({
  specialty: optional(Joi.string().valid(...SPECIALTY_KEYS)),
  available: optional(Joi.boolean()),
});

const patientLookup = Joi.object({
  q: Joi.string().trim().min(3).max(254).required().label("Phone or email"),
});

const recordUpload = Joi.object({
  type: Joi.string().valid(...UPLOADABLE_RECORD_TYPES).required().label("Record type"),
  title: text("Title", 3, 120),
  notes: optionalText("Notes", 2000),
  recordedAt: nullable(Joi.date().iso().max("now").label("Record date")),
});

module.exports = { medicineSearch, doctorSearch, patientLookup, recordUpload };
