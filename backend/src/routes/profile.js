const express = require("express");
const profile = require("../controllers/profileController");
const { profile: schemas } = require("../validators");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.patch("/", requireAuth, validateBody(schemas.updateProfile), profile.update);
router.patch("/language", requireAuth, validateBody(schemas.language), profile.setLanguage);
router.patch("/availability", requireRole("doctor"), validateBody(schemas.availability), profile.setAvailability);
router.patch(
  "/equipment",
  requireRole("sahayak"),
  validateBody(schemas.equipment, { message: "Choose at least one device to update." }),
  profile.setEquipment
);

module.exports = router;
