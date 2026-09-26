const Consultation = require("../models/Consultation");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const recordService = require("./recordService");
const { addMinutes, addDays } = require("../utils/dates");
const {
  OPEN_STATUSES,
  CANCELLABLE_STATUSES,
  STARTABLE_STATUSES,
  SLOT_MINUTES,
  MAX_DAYS_IN_ADVANCE,
  PRIORITY_RANK,
  SPECIALTIES,
} = require("../constants/consultations");

const MAX_MESSAGES = 300;
const MIN_LEAD_MINUTES = 5;

const PARTY_POPULATE = [
  { path: "patient", select: "name phone village patientProfile" },
  { path: "doctor", select: "name village doctorProfile" },
  { path: "sahayak", select: "name phone sahayakProfile.healthCenter" },
];

const specialtyLabel = (key) => SPECIALTIES.find((s) => s.key === key)?.label || key;

function poolFilter(doctor) {
  return {
    doctor: null,
    status: "waiting",
    $or: [{ priority: "emergency" }, { specialty: doctor.doctorProfile.specialization }],
  };
}

function isInPool(consultation, doctor) {
  return (
    consultation.doctor == null &&
    consultation.status === "waiting" &&
    (consultation.priority === "emergency" || consultation.specialty === doctor.doctorProfile.specialization)
  );
}

function sortForQueue(consultations) {
  const when = (c) => (c.scheduledAt || c.createdAt).getTime();
  return consultations.sort(
    (a, b) =>
      Number(b.status === "in_progress") - Number(a.status === "in_progress") ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      when(a) - when(b)
  );
}

async function resolvePatient(actor, patientId) {
  if (actor.role === "patient") {
    if (patientId && !actor._id.equals(patientId)) {
      throw new AppError(403, "You can only book consultations for yourself.");
    }
    return actor;
  }
  if (!patientId) throw new AppError(400, "Please select the patient you are assisting.");
  const patient = await User.findOne({ _id: patientId, role: "patient" });
  if (!patient) throw new AppError(404, "We couldn't find that patient.");
  return patient;
}

async function resolveDoctor(doctorId, { specialty, scheduledAt }) {
  if (!doctorId) {
    if (scheduledAt) throw new AppError(400, "Please choose a doctor for a scheduled appointment.");
    return null;
  }
  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) throw new AppError(404, "We couldn't find that doctor.");
  if (doctor.doctorProfile.specialization !== specialty) {
    throw new AppError(400, `Dr. ${doctor.name} doesn't practise ${specialtyLabel(specialty)}.`);
  }
  if (!scheduledAt && !doctor.doctorProfile.isAvailable) {
    throw new AppError(409, `Dr. ${doctor.name} is not available right now. Schedule a time or choose another doctor.`);
  }
  return doctor;
}

function validateSchedule(scheduledAt, priority) {
  if (!scheduledAt) return;
  if (priority === "emergency") throw new AppError(400, "Emergency consultations can't be scheduled for later.");
  const now = new Date();
  if (scheduledAt < addMinutes(now, MIN_LEAD_MINUTES)) {
    throw new AppError(400, "Appointment time must be at least 5 minutes from now.");
  }
  if (scheduledAt > addDays(now, MAX_DAYS_IN_ADVANCE)) {
    throw new AppError(400, `Appointments can be booked up to ${MAX_DAYS_IN_ADVANCE} days ahead.`);
  }
}

async function assertSlotFree(doctor, scheduledAt) {
  const clash = await Consultation.exists({
    doctor: doctor._id,
    status: { $in: ["scheduled", "waiting", "in_progress"] },
    scheduledAt: { $gt: addMinutes(scheduledAt, -SLOT_MINUTES), $lt: addMinutes(scheduledAt, SLOT_MINUTES) },
  });
  if (clash) {
    throw new AppError(409, `Dr. ${doctor.name} already has an appointment around that time. Please pick another slot.`);
  }
}

async function assertNoActiveInstant(patient, priority) {
  if (priority === "emergency") return;
  const active = await Consultation.exists({
    patient: patient._id,
    status: { $in: ["waiting", "in_progress"] },
    scheduledAt: null,
  });
  if (active) {
    throw new AppError(409, "There is already an active consultation for this patient. Please wait for it to finish or cancel it.");
  }
}

async function create(actor, input) {
  const scheduledAt = input.scheduledAt || null;
  validateSchedule(scheduledAt, input.priority);

  const patient = await resolvePatient(actor, input.patientId);
  const doctor = await resolveDoctor(input.doctorId, { specialty: input.specialty, scheduledAt });
  if (scheduledAt) await assertSlotFree(doctor, scheduledAt);
  else await assertNoActiveInstant(patient, input.priority);

  const now = new Date();
  const vitals = input.vitals ? { ...input.vitals, recordedAt: now, recordedBy: actor._id } : undefined;

  const consultation = await Consultation.create({
    patient: patient._id,
    doctor: doctor?._id || null,
    sahayak: actor.role === "sahayak" ? actor._id : null,
    specialty: input.specialty,
    mode: input.mode,
    priority: input.priority,
    complaint: input.complaint,
    symptoms: input.symptoms,
    vitals,
    scheduledAt,
    status: scheduledAt ? "scheduled" : "waiting",
    fee: input.priority === "emergency" ? 0 : doctor?.doctorProfile.consultationFee || 0,
  });

  if (vitals) {
    await recordService.recordVitals({ patientId: patient._id, consultationId: consultation._id, vitals, recordedBy: actor._id });
  }
  return consultation;
}

function filterFor(user, scope) {
  let filter;
  if (user.role === "patient") filter = { patient: user._id };
  else if (user.role === "sahayak") filter = { sahayak: user._id };
  else filter = scope === "past" ? { doctor: user._id } : { $or: [{ doctor: user._id }, poolFilter(user)] };

  if (scope === "active") return { ...filter, status: { $in: OPEN_STATUSES } };
  if (scope === "past") return { ...filter, status: { $nin: OPEN_STATUSES } };
  return filter;
}

async function listFor(user, scope = "all") {
  const consultations = await Consultation.find(filterFor(user, scope))
    .select("-messages")
    .populate(PARTY_POPULATE)
    .sort({ createdAt: -1 })
    .limit(100);
  return scope === "active" ? sortForQueue(consultations) : consultations;
}

async function getForViewer(id, viewer) {
  const consultation = await Consultation.findById(id)
    .select("+roomId")
    .populate([...PARTY_POPULATE, { path: "messages.sender", select: "name role" }]);
  const visible =
    consultation && (consultation.involves(viewer) || (viewer.role === "doctor" && isInPool(consultation, viewer)));
  if (!visible) throw new AppError(404, "We couldn't find that consultation.");
  return consultation;
}

async function accept(consultation, doctor) {
  if (!isInPool(consultation, doctor)) {
    throw new AppError(409, "This consultation is no longer waiting for a doctor.");
  }
  if (!doctor.doctorProfile.isAvailable) {
    throw new AppError(409, "Set yourself as available before accepting patients.");
  }
  const fee = consultation.priority === "emergency" ? 0 : doctor.doctorProfile.consultationFee || 0;
  const updated = await Consultation.findOneAndUpdate(
    { _id: consultation._id, doctor: null, status: "waiting" },
    { doctor: doctor._id, fee },
    { returnDocument: "after" }
  );
  if (!updated) throw new AppError(409, "Another doctor has already accepted this consultation.");
  return updated;
}

function assertAssignedDoctor(consultation, doctor) {
  if (consultation.roleOf(doctor) !== "doctor") {
    throw new AppError(403, "Only the assigned doctor can do this. Accept the consultation first.");
  }
}

async function transition(consultation, fromStatuses, update, conflictMessage) {
  const updated = await Consultation.findOneAndUpdate(
    { _id: consultation._id, status: { $in: fromStatuses } },
    update,
    { returnDocument: "after" }
  );
  if (!updated) throw new AppError(409, conflictMessage);
  return updated;
}

async function start(consultation, doctor) {
  assertAssignedDoctor(consultation, doctor);
  return transition(
    consultation,
    STARTABLE_STATUSES,
    { status: "in_progress", startedAt: new Date() },
    "This consultation can't be started because it is no longer waiting."
  );
}

async function complete(consultation, doctor, input) {
  assertAssignedDoctor(consultation, doctor);
  const updated = await transition(
    consultation,
    ["in_progress"],
    {
      status: "completed",
      completedAt: new Date(),
      diagnosis: input.diagnosis,
      prescription: input.prescription,
      advice: input.advice,
      followUpDate: input.followUpDate || null,
    },
    "Only a consultation that is in progress can be completed."
  );
  await recordService.recordConsultationSummary(updated, doctor);
  return updated;
}

async function recordVitals(consultation, actor, input) {
  const role = consultation.roleOf(actor);
  if (role !== "sahayak" && role !== "doctor") {
    throw new AppError(403, "Only the attending Sahayak or doctor can record vitals.");
  }
  if (!consultation.isOpen) throw new AppError(409, "Vitals can't be changed after a consultation has ended.");

  const vitals = { ...input, recordedAt: new Date(), recordedBy: actor._id };
  const updated = await Consultation.findByIdAndUpdate(consultation._id, { vitals }, { returnDocument: "after" });
  await recordService.recordVitals({
    patientId: consultation.patient._id,
    consultationId: consultation._id,
    vitals,
    recordedBy: actor._id,
  });
  return updated;
}

async function cancel(consultation, actor, reason) {
  const role = consultation.roleOf(actor);
  if (!role) throw new AppError(403, "You can't cancel this consultation.");
  return transition(
    consultation,
    CANCELLABLE_STATUSES,
    { status: "cancelled", cancelledAt: new Date(), cancelledBy: role, cancelReason: reason },
    "Only scheduled or waiting consultations can be cancelled."
  );
}

async function addMessage(consultation, actor, body) {
  if (!consultation.involves(actor)) {
    throw new AppError(403, "Only people taking part in this consultation can send messages.");
  }
  const updated = await Consultation.findOneAndUpdate(
    { _id: consultation._id, status: { $in: OPEN_STATUSES }, [`messages.${MAX_MESSAGES - 1}`]: { $exists: false } },
    { $push: { messages: { sender: actor._id, body } } },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AppError(409, consultation.isOpen ? "This conversation has reached its message limit." : "This consultation has ended.");
  }
  return updated;
}

module.exports = {
  create,
  listFor,
  getForViewer,
  accept,
  start,
  complete,
  recordVitals,
  cancel,
  addMessage,
  sortForQueue,
};
