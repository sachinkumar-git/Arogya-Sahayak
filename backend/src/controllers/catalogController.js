const medicineService = require("../services/medicineService");
const dashboardService = require("../services/dashboardService");
const { serializeConsultation } = require("../utils/serialize");

async function searchMedicines(req, res) {
  res.json({ medicines: await medicineService.search(req.validQuery.q) });
}

async function medicineAvailability(req, res) {
  res.json(await medicineService.availability(req.params.id));
}

async function dashboard(req, res) {
  const data = await dashboardService.forUser(req.user);
  const serialize = (list) => list.map((c) => serializeConsultation(c, req.user));
  if (data.queue) data.queue = serialize(data.queue);
  if (data.active) data.active = serialize(data.active);
  res.json(data);
}

module.exports = { searchMedicines, medicineAvailability, dashboard };
