const env = require("../config/env");
const { ageFrom } = require("./dates");

const pick = (source, keys) => (source ? Object.fromEntries(keys.map((key) => [key, source[key]])) : undefined);
const plain = (doc) => (doc && typeof doc.toObject === "function" ? doc.toObject() : doc);

function serializeUser(user) {
  const doc = plain(user);
  return {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    phone: doc.phone || "",
    village: doc.village || "",
    preferredLanguage: doc.preferredLanguage,
    patientProfile: doc.role === "patient" ? doc.patientProfile || {} : undefined,
    doctorProfile: doc.role === "doctor" ? doc.doctorProfile : undefined,
    sahayakProfile: doc.role === "sahayak" ? doc.sahayakProfile : undefined,
  };
}

function serializeDoctor(user) {
  const doc = plain(user);
  if (!doc || !doc.name) return null;
  return {
    _id: doc._id,
    name: doc.name,
    village: doc.village,
    doctorProfile: pick(doc.doctorProfile, [
      "specialization",
      "qualification",
      "experienceYears",
      "consultationFee",
      "languages",
      "isAvailable",
    ]),
  };
}

function serializePatient(user) {
  const doc = plain(user);
  if (!doc || !doc.name) return null;
  const profile = doc.patientProfile || {};
  return {
    _id: doc._id,
    name: doc.name,
    phone: doc.phone || "",
    village: doc.village || "",
    age: ageFrom(profile.dateOfBirth),
    gender: profile.gender || null,
    bloodGroup: profile.bloodGroup || null,
    allergies: profile.allergies || "",
    chronicConditions: profile.chronicConditions || "",
  };
}

function serializeSahayak(user) {
  const doc = plain(user);
  if (!doc || !doc.name) return null;
  return { _id: doc._id, name: doc.name, phone: doc.phone || "", healthCenter: doc.sahayakProfile?.healthCenter || "" };
}

function videoRoomUrl(consultation) {
  if (consultation.mode === "chat" || consultation.status !== "in_progress" || !consultation.roomId) return null;
  const url = `${env.videoRoomBaseUrl}/ArogyaSahayak-${consultation.roomId}`;
  return consultation.mode === "audio" ? `${url}#config.startWithVideoMuted=true` : url;
}

function serializeConsultation(consultation, viewer) {
  const doc = plain(consultation);
  const viewerRole = viewer ? consultation.roleOf(viewer) : null;
  const result = {
    ...doc,
    id: undefined,
    roomId: undefined,
    __v: undefined,
    patient: serializePatient(doc.patient) || doc.patient,
    doctor: serializeDoctor(doc.doctor) || doc.doctor,
    sahayak: serializeSahayak(doc.sahayak) || doc.sahayak,
    viewerRole,
    videoRoomUrl: viewerRole ? videoRoomUrl(doc) : null,
  };
  if (Array.isArray(doc.messages)) {
    result.messages = doc.messages.map((m) => ({
      _id: m._id,
      body: m.body,
      createdAt: m.createdAt,
      sender: m.sender && m.sender.name ? { _id: m.sender._id, name: m.sender.name, role: m.sender.role } : m.sender,
    }));
  }
  return result;
}

module.exports = { serializeUser, serializeDoctor, serializePatient, serializeSahayak, serializeConsultation };
