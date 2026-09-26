const Joi = require("joi");
const {
  SPECIALTY_KEYS,
  MODES,
  PRIORITIES,
  MAX_MESSAGE_LENGTH,
  MAX_PRESCRIPTION_ITEMS,
} = require("../constants/consultations");
const { text, optionalText, objectId, optional, nullable } = require("./common");

const vitals = Joi.object({
  systolic: Joi.number().integer().min(50).max(260).label("Systolic BP"),
  diastolic: Joi.number().integer().min(30).max(160).label("Diastolic BP"),
  pulse: Joi.number().integer().min(20).max(250).label("Pulse"),
  temperature: Joi.number().min(90).max(110).label("Temperature (°F)"),
  spo2: Joi.number().integer().min(50).max(100).label("SpO₂"),
  bloodSugar: Joi.number().integer().min(20).max(600).label("Blood sugar"),
  weight: Joi.number().min(1).max(300).label("Weight"),
})
  .and("systolic", "diastolic")
  .messages({ "object.and": "Enter both systolic and diastolic blood pressure" })
  .min(1)
  .label("Vitals");

const create = Joi.object({
  patientId: objectId("Patient"),
  doctorId: objectId("Doctor").allow(null, ""),
  specialty: Joi.string().valid(...SPECIALTY_KEYS).required().label("Specialty"),
  mode: Joi.string().valid(...MODES).required().label("Consultation type"),
  priority: Joi.string().valid(...PRIORITIES).default("normal").label("Priority"),
  complaint: text("Main complaint", 3, 200),
  symptoms: optionalText("Symptoms", 2000),
  scheduledAt: nullable(Joi.date().iso().label("Appointment time")),
  vitals: vitals.optional(),
});

const cancel = Joi.object({
  reason: optionalText("Reason", 300),
});

const prescriptionItem = Joi.object({
  medicine: text("Medicine", 2, 80),
  dosage: optionalText("Dosage", 40),
  frequency: optionalText("Frequency", 60),
  duration: optionalText("Duration", 40),
});

const complete = Joi.object({
  diagnosis: text("Diagnosis", 3, 1000),
  prescription: Joi.array().items(prescriptionItem).max(MAX_PRESCRIPTION_ITEMS).default([]).label("Prescription"),
  advice: optionalText("Advice", 1000),
  followUpDate: nullable(Joi.date().iso().min("now").label("Follow-up date")),
});

const message = Joi.object({
  body: text("Message", 1, MAX_MESSAGE_LENGTH),
});

const listQuery = Joi.object({
  scope: optional(Joi.string().valid("active", "past", "all"), "all").default("all"),
});

module.exports = { vitals: Joi.object({ vitals: vitals.required() }), create, cancel, complete, message, listQuery };
