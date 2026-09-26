const consultationService = require("../services/consultationService");

async function loadConsultation(req, res, next) {
  req.consultation = await consultationService.getForViewer(req.params.id, req.user);
  next();
}

module.exports = { loadConsultation };
