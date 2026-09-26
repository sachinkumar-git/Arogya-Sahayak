const userService = require("../services/userService");
const recordService = require("../services/recordService");
const { serializeDoctor, serializePatient } = require("../utils/serialize");

async function listDoctors(req, res) {
  const doctors = await userService.listDoctors(req.validQuery);
  res.json({ doctors: doctors.map(serializeDoctor) });
}

async function lookupPatient(req, res) {
  const patient = await userService.lookupPatient(req.validQuery.q);
  res.json({ patient: patient ? serializePatient(patient) : null });
}

async function patientRecords(req, res) {
  await recordService.assertCanAccessPatient(req.user, req.params.id);
  const patient = await userService.findPatientById(req.params.id);
  const [records, latestVitals] = await Promise.all([
    recordService.listForPatient(patient._id),
    recordService.latestVitals(patient._id),
  ]);
  res.json({ patient: serializePatient(patient), records, latestVitals });
}

module.exports = { listDoctors, lookupPatient, patientRecords };
