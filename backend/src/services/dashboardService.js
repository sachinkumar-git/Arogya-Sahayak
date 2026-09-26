const Consultation = require("../models/Consultation");
const HealthRecord = require("../models/HealthRecord");
const Pharmacy = require("../models/Pharmacy");
const User = require("../models/User");
const consultationService = require("./consultationService");
const recordService = require("./recordService");
const { startOfToday } = require("../utils/dates");

async function forPatient(patient) {
  const [active, recentRecords, latestVitals, availableDoctors, pharmacies, completed] = await Promise.all([
    consultationService.listFor(patient, "active"),
    HealthRecord.find({ patient: patient._id }).sort({ recordedAt: -1 }).limit(3).populate("recordedBy", "name role"),
    recordService.latestVitals(patient._id),
    User.countDocuments({ role: "doctor", "doctorProfile.isAvailable": true }),
    Pharmacy.countDocuments({ isActive: true }),
    Consultation.countDocuments({ patient: patient._id, status: "completed" }),
  ]);
  return { active, recentRecords, latestVitals, stats: { availableDoctors, pharmacies, completed } };
}

async function forDoctor(doctor) {
  const today = startOfToday();
  const [queue, completedToday, totalCompleted] = await Promise.all([
    consultationService.listFor(doctor, "active"),
    Consultation.countDocuments({ doctor: doctor._id, status: "completed", completedAt: { $gte: today } }),
    Consultation.countDocuments({ doctor: doctor._id, status: "completed" }),
  ]);
  const count = (predicate) => queue.filter(predicate).length;
  return {
    queue,
    isAvailable: doctor.doctorProfile.isAvailable,
    stats: {
      waiting: count((c) => c.status === "waiting"),
      scheduled: count((c) => c.status === "scheduled"),
      inProgress: count((c) => c.status === "in_progress"),
      urgent: count((c) => c.priority !== "normal"),
      completedToday,
      totalCompleted,
    },
  };
}

async function forSahayak(sahayak) {
  const today = startOfToday();
  const [active, assistedToday, completedToday] = await Promise.all([
    consultationService.listFor(sahayak, "active"),
    Consultation.countDocuments({ sahayak: sahayak._id, createdAt: { $gte: today } }),
    Consultation.countDocuments({ sahayak: sahayak._id, status: "completed", completedAt: { $gte: today } }),
  ]);
  const equipment = sahayak.sahayakProfile?.equipment?.toObject?.() || {};
  return {
    active,
    equipment,
    stats: {
      active: active.length,
      assistedToday,
      completedToday,
      equipmentConnected: Object.values(equipment).filter(Boolean).length,
    },
  };
}

const BUILDERS = { patient: forPatient, doctor: forDoctor, sahayak: forSahayak };

module.exports = { forUser: (user) => BUILDERS[user.role](user) };
