const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startApp, stopApp, send, signup, inMinutes } = require("../helpers");
const Consultation = require("../../src/models/Consultation");
const HealthRecord = require("../../src/models/HealthRecord");

const book = (agent, body) =>
  send(agent, "post", "/api/consultations", { specialty: "general", mode: "video", complaint: "Fever and headache", ...body });

describe("patient → sahayak → doctor consultation workflow", () => {
  let app;
  let patient;
  let otherPatient;
  let sahayak;
  let doctor;
  let secondDoctor;
  let pediatrician;
  let consultationId;

  before(async () => {
    app = await startApp();
    patient = await signup(app, { name: "Ram Singh", email: "ram@example.com", phone: "+91 98123 45670" });
    otherPatient = await signup(app, { name: "Sita Devi", email: "sita@example.com" });
    sahayak = await signup(app, { name: "Priya Sharma", email: "priya@example.com", role: "sahayak" });
    doctor = await signup(app, { name: "Anjali Verma", email: "anjali@example.com", role: "doctor" });
    secondDoctor = await signup(app, { name: "Rajesh Kumar", email: "rajesh@example.com", role: "doctor" });
    pediatrician = await signup(app, {
      name: "Meera Singh",
      email: "meera@example.com",
      role: "doctor",
      extra: {
        doctor: { specialization: "pediatrics", qualification: "MBBS, DCH", licenseNumber: "PMC-2002", experienceYears: 15, consultationFee: 200 },
      },
    });
  });

  after(stopApp);

  it("lists doctors by specialty for booking", async () => {
    const res = await patient.agent.get("/api/doctors?specialty=general");
    assert.deepEqual(res.body.doctors.map((d) => d.name).sort(), ["Anjali Verma", "Rajesh Kumar"]);
    assert.equal(res.body.doctors[0].doctorProfile.licenseNumber, undefined);
  });

  it("validates booking input", async () => {
    const res = await book(patient.agent, { complaint: "", mode: "fax" });
    assert.equal(res.status, 400);
    assert.equal(res.body.errors.complaint, "Main complaint is required");
    assert.match(res.body.errors.mode, /Consultation type must be one of/);
  });

  it("rejects a doctor from a different specialty", async () => {
    const res = await book(patient.agent, { doctorId: pediatrician.user._id });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "Dr. Meera Singh doesn't practise General Medicine.");
  });

  it("validates appointment times", async () => {
    const past = await book(patient.agent, { doctorId: doctor.user._id, scheduledAt: inMinutes(-30) });
    assert.equal(past.body.error, "Appointment time must be at least 5 minutes from now.");
    const far = await book(patient.agent, { doctorId: doctor.user._id, scheduledAt: inMinutes(60 * 24 * 45) });
    assert.equal(far.body.error, "Appointments can be booked up to 30 days ahead.");
    const pool = await book(patient.agent, { scheduledAt: inMinutes(120) });
    assert.equal(pool.body.error, "Please choose a doctor for a scheduled appointment.");
    const garbage = await book(patient.agent, { doctorId: doctor.user._id, scheduledAt: "next tuesday" });
    assert.equal(garbage.status, 400);
    assert.equal(garbage.body.errors.scheduledAt, "Appointment time must be in ISO 8601 date format");
    const emergency = await book(patient.agent, { doctorId: doctor.user._id, priority: "emergency", scheduledAt: inMinutes(120) });
    assert.equal(emergency.body.error, "Emergency consultations can't be scheduled for later.");
  });

  it("books a scheduled appointment with a fee snapshot and blocks overlapping slots", async () => {
    const res = await book(patient.agent, { doctorId: doctor.user._id, scheduledAt: inMinutes(180) });
    assert.equal(res.status, 201);
    assert.equal(res.body.consultation.status, "scheduled");
    assert.equal(res.body.consultation.fee, 150);
    assert.equal(res.body.consultation.doctor.name, "Anjali Verma");

    const clash = await book(otherPatient.agent, { doctorId: doctor.user._id, scheduledAt: inMinutes(190) });
    assert.equal(clash.status, 409);
    assert.match(clash.body.error, /already has an appointment around that time/);

    const later = await book(otherPatient.agent, { doctorId: doctor.user._id, scheduledAt: inMinutes(210) });
    assert.equal(later.status, 201);
  });

  it("lets the patient cancel a scheduled appointment", async () => {
    const scheduled = await Consultation.findOne({ patient: patient.user._id, status: "scheduled" });
    const res = await send(patient.agent, "patch", `/api/consultations/${scheduled._id}/cancel`, { reason: "Feeling better" });
    assert.equal(res.body.consultation.status, "cancelled");
    assert.equal(res.body.consultation.cancelledBy, "patient");
    const again = await send(patient.agent, "patch", `/api/consultations/${scheduled._id}/cancel`, {});
    assert.equal(again.status, 409);
  });

  it("lets a sahayak find the patient by phone and book with vitals", async () => {
    const lookup = await sahayak.agent.get("/api/patients/lookup?q=9812345670");
    assert.equal(lookup.body.patient.name, "Ram Singh");
    assert.equal(lookup.body.patient.email, undefined);

    const invalidVitals = await book(sahayak.agent, { patientId: lookup.body.patient._id, vitals: { systolic: 140 } });
    assert.equal(invalidVitals.status, 400);
    assert.equal(invalidVitals.body.errors.vitals, "Enter both systolic and diastolic blood pressure");

    const res = await book(sahayak.agent, {
      patientId: lookup.body.patient._id,
      priority: "high",
      symptoms: "Fever for 3 days",
      vitals: { systolic: 140, diastolic: 90, pulse: 88, temperature: 101.5, spo2: 96 },
    });
    assert.equal(res.status, 201);
    consultationId = res.body.consultation._id;
    assert.equal(res.body.consultation.status, "waiting");
    assert.equal(res.body.consultation.doctor, null);
    assert.equal(res.body.consultation.sahayak.name, "Priya Sharma");
    assert.equal(res.body.consultation.vitals.temperature, 101.5);
    assert.equal(await HealthRecord.countDocuments({ patient: patient.user._id, type: "vitals" }), 1);
  });

  it("prevents duplicate instant consultations for the same patient", async () => {
    const res = await book(patient.agent, {});
    assert.equal(res.status, 409);
    assert.match(res.body.error, /already an active consultation/);
  });

  it("shows unassigned cases only to doctors of that specialty", async () => {
    const queue = await doctor.agent.get("/api/dashboard");
    assert.equal(queue.body.queue[0]._id, consultationId);
    assert.equal(queue.body.stats.urgent, 1);
    assert.equal((await pediatrician.agent.get(`/api/consultations/${consultationId}`)).status, 404);
    assert.equal((await otherPatient.agent.get(`/api/consultations/${consultationId}`)).status, 404);
  });

  it("does not let a doctor start a case they haven't accepted", async () => {
    const res = await send(doctor.agent, "patch", `/api/consultations/${consultationId}/start`);
    assert.equal(res.status, 403);
  });

  it("lets exactly one doctor accept a pooled case", async () => {
    const [first, second] = await Promise.all([
      send(doctor.agent, "patch", `/api/consultations/${consultationId}/accept`),
      send(secondDoctor.agent, "patch", `/api/consultations/${consultationId}/accept`),
    ]);
    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [200, 409]);

    const winner = first.status === 200 ? doctor : secondDoctor;
    const loser = winner === doctor ? secondDoctor : doctor;
    assert.equal((await loser.agent.get(`/api/consultations/${consultationId}`)).status, 404);

    if (winner !== doctor) await Consultation.updateOne({ _id: consultationId }, { doctor: doctor.user._id });
  });

  it("starts the consultation and gives participants a private video room", async () => {
    const res = await send(doctor.agent, "patch", `/api/consultations/${consultationId}/start`);
    assert.equal(res.body.consultation.status, "in_progress");
    assert.match(res.body.consultation.videoRoomUrl, /^https:\/\/meet\.jit\.si\/ArogyaSahayak-[a-f0-9]{24}$/);
    const patientView = await patient.agent.get(`/api/consultations/${consultationId}`);
    assert.equal(patientView.body.consultation.videoRoomUrl, res.body.consultation.videoRoomUrl);
    assert.equal(patientView.body.consultation.roomId, undefined);
  });

  it("lets participants exchange messages, but no one else", async () => {
    const sent = await send(patient.agent, "post", `/api/consultations/${consultationId}/messages`, { body: "Namaste doctor ji" });
    assert.equal(sent.status, 201);
    const reply = await send(doctor.agent, "post", `/api/consultations/${consultationId}/messages`, { body: "Please describe the fever pattern." });
    assert.deepEqual(
      reply.body.consultation.messages.map((m) => [m.sender.name, m.body]),
      [["Ram Singh", "Namaste doctor ji"], ["Anjali Verma", "Please describe the fever pattern."]]
    );
    const outsider = await send(otherPatient.agent, "post", `/api/consultations/${consultationId}/messages`, { body: "hi" });
    assert.equal(outsider.status, 404);
  });

  it("lets the sahayak update vitals during the consultation", async () => {
    const res = await send(sahayak.agent, "patch", `/api/consultations/${consultationId}/vitals`, { vitals: { spo2: 95, pulse: 92 } });
    assert.equal(res.status, 200);
    assert.equal(res.body.consultation.vitals.spo2, 95);
    const patientAttempt = await send(patient.agent, "patch", `/api/consultations/${consultationId}/vitals`, { vitals: { spo2: 99 } });
    assert.equal(patientAttempt.status, 403);
  });

  it("does not allow cancelling a consultation that is in progress", async () => {
    const res = await send(patient.agent, "patch", `/api/consultations/${consultationId}/cancel`, {});
    assert.equal(res.status, 409);
  });

  it("completes with a diagnosis and prescription, writing to the health record", async () => {
    const invalid = await send(doctor.agent, "patch", `/api/consultations/${consultationId}/complete`, { diagnosis: "" });
    assert.equal(invalid.status, 400);

    const res = await send(doctor.agent, "patch", `/api/consultations/${consultationId}/complete`, {
      diagnosis: "Viral fever",
      prescription: [{ medicine: "Paracetamol", dosage: "500mg", frequency: "Three times a day", duration: "3 days" }],
      advice: "Rest and fluids",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.consultation.status, "completed");
    assert.equal(res.body.consultation.videoRoomUrl, null);

    const records = await patient.agent.get("/api/records");
    const summary = records.body.records.find((r) => r.type === "consultation");
    assert.equal(summary.title, "Consultation with Dr. Anjali Verma");
    assert.equal(summary.consultation.prescription[0].medicine, "Paracetamol");
    assert.equal(records.body.latestVitals.vitals.spo2, 95);

    const closed = await send(patient.agent, "post", `/api/consultations/${consultationId}/messages`, { body: "Thank you" });
    assert.equal(closed.status, 409);
    assert.equal(closed.body.error, "This consultation has ended.");
  });

  it("lets the treating doctor see the patient's history, but not unrelated doctors", async () => {
    const res = await doctor.agent.get(`/api/patients/${patient.user._id}/records`);
    assert.equal(res.status, 200);
    assert.equal(res.body.patient.name, "Ram Singh");
    assert.ok(res.body.records.length >= 2);
    assert.equal((await pediatrician.agent.get(`/api/patients/${patient.user._id}/records`)).status, 404);
  });

  it("sends emergencies to every available doctor without a fee", async () => {
    const res = await book(otherPatient.agent, { specialty: "cardiology", priority: "emergency", complaint: "Chest pain" });
    assert.equal(res.status, 201);
    assert.equal(res.body.consultation.fee, 0);
    const queue = await pediatrician.agent.get("/api/dashboard");
    assert.equal(queue.body.queue[0].priority, "emergency");
  });

  it("requires a doctor to be available before accepting new cases", async () => {
    await send(pediatrician.agent, "patch", "/api/profile/availability", { isAvailable: false });
    const emergency = await Consultation.findOne({ priority: "emergency" });
    const res = await send(pediatrician.agent, "patch", `/api/consultations/${emergency._id}/accept`);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, "Set yourself as available before accepting patients.");

    const instant = await book(patient.agent, { specialty: "pediatrics", doctorId: pediatrician.user._id });
    assert.equal(instant.status, 409);
    assert.match(instant.body.error, /not available right now/);
  });

  it("returns 404 for malformed ids", async () => {
    assert.equal((await patient.agent.get("/api/consultations/not-an-id")).status, 404);
  });
});
