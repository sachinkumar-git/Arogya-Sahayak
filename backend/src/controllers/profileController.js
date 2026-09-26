const userService = require("../services/userService");
const { serializeUser } = require("../utils/serialize");

async function update(req, res) {
  const user = await userService.updateProfile(req.user, req.body);
  res.json({ user: serializeUser(user) });
}

async function setLanguage(req, res) {
  const user = await userService.setLanguage(req.user, req.body.preferredLanguage);
  res.json({ user: serializeUser(user) });
}

async function setAvailability(req, res) {
  const user = await userService.setDoctorAvailability(req.user, req.body.isAvailable);
  res.json({ user: serializeUser(user) });
}

async function setEquipment(req, res) {
  const user = await userService.setEquipment(req.user, req.body);
  res.json({ user: serializeUser(user) });
}

module.exports = { update, setLanguage, setAvailability, setEquipment };
