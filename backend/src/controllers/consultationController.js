const consultationService = require("../services/consultationService");
const { serializeConsultation } = require("../utils/serialize");

async function respond(res, id, user, status = 200) {
  const consultation = await consultationService.getForViewer(id, user);
  res.status(status).json({ consultation: serializeConsultation(consultation, user) });
}

async function list(req, res) {
  const consultations = await consultationService.listFor(req.user, req.validQuery.scope);
  res.json({ consultations: consultations.map((c) => serializeConsultation(c, req.user)) });
}

async function create(req, res) {
  const consultation = await consultationService.create(req.user, req.body);
  await respond(res, consultation._id, req.user, 201);
}

function show(req, res) {
  res.json({ consultation: serializeConsultation(req.consultation, req.user) });
}

async function accept(req, res) {
  await consultationService.accept(req.consultation, req.user);
  await respond(res, req.consultation._id, req.user);
}

async function start(req, res) {
  await consultationService.start(req.consultation, req.user);
  await respond(res, req.consultation._id, req.user);
}

async function complete(req, res) {
  await consultationService.complete(req.consultation, req.user, req.body);
  await respond(res, req.consultation._id, req.user);
}

async function recordVitals(req, res) {
  await consultationService.recordVitals(req.consultation, req.user, req.body.vitals);
  await respond(res, req.consultation._id, req.user);
}

async function cancel(req, res) {
  await consultationService.cancel(req.consultation, req.user, req.body.reason);
  await respond(res, req.consultation._id, req.user);
}

async function addMessage(req, res) {
  await consultationService.addMessage(req.consultation, req.user, req.body.body);
  await respond(res, req.consultation._id, req.user, 201);
}

module.exports = { list, create, show, accept, start, complete, recordVitals, cancel, addMessage };
