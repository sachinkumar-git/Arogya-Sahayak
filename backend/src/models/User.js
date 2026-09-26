const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;
const { ROLES, LANGUAGE_CODES, GENDERS, BLOOD_GROUPS, EQUIPMENT_KEYS } = require("../constants/users");
const { SPECIALTY_KEYS } = require("../constants/consultations");

const patientProfileSchema = new mongoose.Schema(
  {
    dateOfBirth: Date,
    gender: { type: String, enum: GENDERS },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    allergies: { type: String, trim: true, maxlength: 300 },
    chronicConditions: { type: String, trim: true, maxlength: 300 },
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 60 },
      phone: { type: String, trim: true, maxlength: 20 },
      relation: { type: String, trim: true, maxlength: 30 },
    },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    specialization: { type: String, enum: SPECIALTY_KEYS, default: "general" },
    qualification: { type: String, trim: true, maxlength: 100 },
    licenseNumber: { type: String, trim: true, maxlength: 40 },
    experienceYears: { type: Number, min: 0, max: 60, default: 0 },
    consultationFee: { type: Number, min: 0, max: 5000, default: 0 },
    languages: { type: [String], enum: LANGUAGE_CODES, default: ["en"] },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const equipmentShape = Object.fromEntries(EQUIPMENT_KEYS.map((key) => [key, { type: Boolean, default: false }]));

const sahayakProfileSchema = new mongoose.Schema(
  {
    healthCenter: { type: String, trim: true, maxlength: 100 },
    certification: { type: String, trim: true, maxlength: 100 },
    equipment: { type: new mongoose.Schema(equipmentShape, { _id: false }), default: () => ({}) },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ROLES, required: true, immutable: true },
    phone: { type: String, trim: true, maxlength: 20 },
    village: { type: String, trim: true, maxlength: 60 },
    preferredLanguage: { type: String, enum: LANGUAGE_CODES, default: "en" },
    patientProfile: patientProfileSchema,
    doctorProfile: doctorProfileSchema,
    sahayakProfile: sahayakProfileSchema,
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });
userSchema.index({ role: 1, "doctorProfile.specialization": 1, "doctorProfile.isAvailable": 1 });

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameLowerCase: true,
  errorMessages: {
    IncorrectPasswordError: "Incorrect email or password.",
    IncorrectUsernameError: "Incorrect email or password.",
    UserExistsError: "An account with this email already exists.",
  },
});

module.exports = mongoose.model("User", userSchema);
