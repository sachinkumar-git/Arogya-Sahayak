const Joi = require("joi");
const { ROLES, LANGUAGE_CODES } = require("../constants/users");
const { SPECIALTY_KEYS } = require("../constants/consultations");
const { text, optionalText, phone } = require("./common");

const doctorDetails = Joi.object({
  specialization: Joi.string().valid(...SPECIALTY_KEYS).required().label("Specialization"),
  qualification: text("Qualification", 2, 100),
  licenseNumber: text("Medical registration number", 3, 40),
  experienceYears: Joi.number().integer().min(0).max(60).required().label("Years of experience"),
  consultationFee: Joi.number().integer().min(0).max(5000).required().label("Consultation fee"),
});

const sahayakDetails = Joi.object({
  healthCenter: text("Health centre", 2, 100),
  certification: optionalText("Certification", 100),
});

const signup = Joi.object({
  name: text("Full name", 2, 60),
  email: Joi.string().trim().lowercase().email().max(254).required().label("Email"),
  password: Joi.string().min(8).max(128).required().label("Password"),
  role: Joi.string().valid(...ROLES).required().label("Role"),
  phone: phone().allow(""),
  village: optionalText("Village", 60),
  preferredLanguage: Joi.string().valid(...LANGUAGE_CODES).default("en"),
  doctor: Joi.when("role", { is: "doctor", then: doctorDetails.required(), otherwise: Joi.forbidden() }),
  sahayak: Joi.when("role", { is: "sahayak", then: sahayakDetails.required(), otherwise: Joi.forbidden() }),
});

const login = Joi.object({
  email: Joi.string().trim().max(254).required().label("Email"),
  password: Joi.string().max(128).required().label("Password"),
});

module.exports = { signup, login };
