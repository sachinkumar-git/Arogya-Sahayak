const User = require("../models/User");
const AppError = require("../utils/AppError");
const { normalizePhone, escapeRegex } = require("../utils/text");

const ROLE_SECTIONS = { patient: "patientProfile", doctor: "doctorProfile", sahayak: "sahayakProfile" };

function buildRoleProfile(role, input) {
  if (role === "doctor") return { doctorProfile: { ...input.doctor, languages: [input.preferredLanguage || "en"] } };
  if (role === "sahayak") return { sahayakProfile: { ...input.sahayak } };
  return { patientProfile: {} };
}

async function register(input) {
  const user = new User({
    name: input.name,
    email: input.email,
    role: input.role,
    phone: normalizePhone(input.phone),
    village: input.village,
    preferredLanguage: input.preferredLanguage,
    ...buildRoleProfile(input.role, input),
  });

  try {
    return await User.register(user, input.password);
  } catch (err) {
    if (err.name === "UserExistsError") {
      const error = new AppError(400, err.message);
      error.fields = { email: err.message };
      throw error;
    }
    throw err;
  }
}

async function updateProfile(user, input) {
  for (const [role, section] of Object.entries(ROLE_SECTIONS)) {
    if (input[section] && role !== user.role) {
      throw new AppError(400, "Those profile details don't apply to your account type.");
    }
  }

  user.name = input.name;
  if (input.phone !== undefined) user.phone = normalizePhone(input.phone);
  if (input.village !== undefined) user.village = input.village;
  if (input.preferredLanguage) user.preferredLanguage = input.preferredLanguage;

  const section = ROLE_SECTIONS[user.role];
  if (input[section]) {
    const current = user[section]?.toObject?.() || {};
    user.set(section, { ...current, ...input[section] });
  }

  await user.save();
  return user;
}

async function setLanguage(user, preferredLanguage) {
  user.preferredLanguage = preferredLanguage;
  await user.save();
  return user;
}

async function setDoctorAvailability(doctor, isAvailable) {
  doctor.doctorProfile.isAvailable = isAvailable;
  await doctor.save();
  return doctor;
}

async function setEquipment(sahayak, equipment) {
  for (const [key, connected] of Object.entries(equipment)) {
    sahayak.sahayakProfile.equipment[key] = connected;
  }
  await sahayak.save();
  return sahayak;
}

async function lookupPatient(query) {
  const trimmed = query.trim();
  if (trimmed.includes("@")) {
    return User.findOne({ role: "patient", email: trimmed.toLowerCase() });
  }
  const digits = normalizePhone(trimmed).replace(/\D/g, "");
  if (digits.length < 10) throw new AppError(400, "Enter a full 10-digit phone number or an email address.");
  return User.findOne({ role: "patient", phone: new RegExp(`${escapeRegex(digits.slice(-10))}$`) });
}

async function findPatientById(id) {
  const patient = await User.findOne({ _id: id, role: "patient" });
  if (!patient) throw new AppError(404, "We couldn't find that patient.");
  return patient;
}

async function listDoctors({ specialty, available } = {}) {
  const filter = { role: "doctor" };
  if (specialty) filter["doctorProfile.specialization"] = specialty;
  if (available !== null && available !== undefined) filter["doctorProfile.isAvailable"] = available;
  return User.find(filter)
    .sort({ "doctorProfile.isAvailable": -1, "doctorProfile.experienceYears": -1, name: 1 })
    .limit(50);
}

module.exports = {
  register,
  updateProfile,
  setLanguage,
  setDoctorAvailability,
  setEquipment,
  lookupPatient,
  findPatientById,
  listDoctors,
};
