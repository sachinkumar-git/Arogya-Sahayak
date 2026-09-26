const recordService = require("../services/recordService");

async function list(req, res) {
  const [records, latestVitals] = await Promise.all([
    recordService.listForPatient(req.user._id),
    recordService.latestVitals(req.user._id),
  ]);
  res.json({ records, latestVitals });
}

async function create(req, res) {
  const record = await recordService.upload(req.user, req.body, req.file);
  res.status(201).json({ record });
}

async function file(req, res) {
  const { record, filePath } = await recordService.findWithFile(req.params.id, req.user);
  res.set("Cache-Control", "private, no-store");
  res.type(record.file.mimeType);
  res.attachment(record.file.originalName);
  if (req.query.inline === "1") res.set("Content-Disposition", res.get("Content-Disposition").replace("attachment", "inline"));
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: "This file is no longer available." });
  });
}

async function remove(req, res) {
  await recordService.remove(req.params.id, req.user);
  res.json({ ok: true });
}

module.exports = { list, create, file, remove };
