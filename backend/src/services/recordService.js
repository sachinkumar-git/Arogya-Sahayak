const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const env = require("../config/env");
const Consultation = require("../models/Consultation");
const HealthRecord = require("../models/HealthRecord");
const AppError = require("../utils/AppError");
const { UPLOAD_MIME_TYPES } = require("../constants/records");

const RECORD_POPULATE = [
  { path: "recordedBy", select: "name role" },
  {
    path: "consultation",
    select: "specialty diagnosis prescription advice followUpDate doctor completedAt",
    populate: { path: "doctor", select: "name doctorProfile.specialization" },
  },
];

async function listForPatient(patientId) {
  return HealthRecord.find({ patient: patientId }).sort({ recordedAt: -1 }).limit(200).populate(RECORD_POPULATE);
}

async function latestVitals(patientId) {
  return HealthRecord.findOne({ patient: patientId, type: "vitals" }).sort({ recordedAt: -1 });
}

async function canAccessPatient(viewer, patientId) {
  if (viewer._id.equals(patientId)) return true;
  if (viewer.role === "patient") return false;
  const field = viewer.role === "doctor" ? "doctor" : "sahayak";
  return Boolean(await Consultation.exists({ patient: patientId, [field]: viewer._id }));
}

async function assertCanAccessPatient(viewer, patientId) {
  if (!(await canAccessPatient(viewer, patientId))) {
    throw new AppError(404, "We couldn't find that patient's records.");
  }
}

async function recordVitals({ patientId, consultationId, vitals, recordedBy }) {
  return HealthRecord.create({
    patient: patientId,
    consultation: consultationId,
    type: "vitals",
    title: "Vitals check",
    vitals,
    recordedBy,
    recordedAt: vitals.recordedAt,
  });
}

async function recordConsultationSummary(consultation, doctor) {
  return HealthRecord.create({
    patient: consultation.patient._id || consultation.patient,
    consultation: consultation._id,
    type: "consultation",
    title: `Consultation with Dr. ${doctor.name}`,
    notes: consultation.diagnosis,
    recordedBy: doctor._id,
    recordedAt: consultation.completedAt,
  });
}

async function storeFile(file) {
  const storedName = `${crypto.randomBytes(16).toString("hex")}${UPLOAD_MIME_TYPES[file.mimetype]}`;
  await fs.mkdir(env.uploadDir, { recursive: true });
  await fs.writeFile(path.join(env.uploadDir, storedName), file.buffer);
  return {
    storedName,
    originalName: path.basename(file.originalname).slice(0, 200),
    mimeType: file.mimetype,
    size: file.size,
  };
}

async function upload(patient, input, file) {
  const stored = file ? await storeFile(file) : undefined;
  const record = await HealthRecord.create({
    patient: patient._id,
    type: input.type,
    title: input.title,
    notes: input.notes,
    file: stored,
    hasFile: Boolean(stored),
    recordedBy: patient._id,
    recordedAt: input.recordedAt || new Date(),
  });
  return HealthRecord.findById(record._id).populate(RECORD_POPULATE);
}

async function findWithFile(recordId, viewer) {
  const record = await HealthRecord.findById(recordId).select("+file");
  if (!record) throw new AppError(404, "We couldn't find that record.");
  await assertCanAccessPatient(viewer, record.patient);
  if (!record.hasFile) throw new AppError(404, "This record has no attached file.");
  return { record, filePath: path.join(env.uploadDir, record.file.storedName) };
}

async function remove(recordId, patient) {
  const record = await HealthRecord.findOne({ _id: recordId, patient: patient._id }).select("+file");
  if (!record) throw new AppError(404, "We couldn't find that record.");
  if (!record.recordedBy.equals(patient._id)) {
    throw new AppError(403, "Records added by your doctor or Sahayak can't be deleted.");
  }
  await record.deleteOne();
  if (record.file) await fs.rm(path.join(env.uploadDir, record.file.storedName), { force: true });
}

module.exports = {
  listForPatient,
  latestVitals,
  canAccessPatient,
  assertCanAccessPatient,
  recordVitals,
  recordConsultationSummary,
  upload,
  findWithFile,
  remove,
};
