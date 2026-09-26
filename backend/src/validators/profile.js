const Joi = require("joi");
const { LANGUAGE_CODES, GENDERS, BLOOD_GROUPS, EQUIPMENT_KEYS } = require("../constants/users");
const { SPECIALTY_KEYS } = require("../constants/consultations");
const { text, optionalText, phone, nullable } = require("./common");

const patientProfile = Joi.object({
  dateOfBirth: nullable(Joi.date().iso().max("now").label("Date of birth")),
  gender: nullable(Joi.string().valid(...GENDERS).label("Gender")),
  bloodGroup: nullable(Joi.string().valid(...BLOOD_GROUPS).label("Blood group")),
  allergies: optionalText("Allergies", 300),
  chronicConditions: optionalText("Chronic conditions", 300),
  emergencyContact: Joi.object({
    name: optionalText("Emergency contact name", 60),
    phone: phone("Emergency contact phone").allow(""),
    relation: optionalText("Relation", 30),
  }),
});

const doctorProfile = Joi.object({
  specialization: Joi.string().valid(...SPECIALTY_KEYS).label("Specialization"),
  qualification: text("Qualification", 2, 100).optional(),
  licenseNumber: text("Medical registration number", 3, 40).optional(),
  experienceYears: Joi.number().integer().min(0).max(60).label("Years of experience"),
  consultationFee: Joi.number().integer().min(0).max(5000).label("Consultation fee"),
  languages: Joi.array().items(Joi.string().valid(...LANGUAGE_CODES)).min(1).unique().label("Languages"),
});

const sahayakProfile = Joi.object({
  healthCenter: text("Health centre", 2, 100).optional(),
  certification: optionalText("Certification", 100),
});

const updateProfile = Joi.object({
  name: text("Full name", 2, 60),
  phone: phone().allow(""),
  village: optionalText("Village", 60),
  preferredLanguage: Joi.string().valid(...LANGUAGE_CODES),
  patientProfile,
  doctorProfile,
  sahayakProfile,
});

const language = Joi.object({
  preferredLanguage: Joi.string().valid(...LANGUAGE_CODES).required(),
});

const availability = Joi.object({
  isAvailable: Joi.boolean().required(),
});

const equipment = Joi.object(Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, Joi.boolean()]))).min(1);

module.exports = { updateProfile, language, availability, equipment };
