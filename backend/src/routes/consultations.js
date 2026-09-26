const express = require("express");
const rateLimit = require("express-rate-limit");
const consultations = require("../controllers/consultationController");
const { consultations: schemas } = require("../validators");
const env = require("../config/env");
const { validateBody, validateQuery } = require("../middleware/validate");
const { requireAuth, requireRole, validateObjectId } = require("../middleware/auth");
const { loadConsultation } = require("../middleware/loaders");

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.isTest,
  handler(req, res) {
    res.status(429).json({ error: "You're sending messages too quickly. Please slow down." });
  },
});

router.param("id", validateObjectId);
router.use(requireAuth);

router.get("/", validateQuery(schemas.listQuery), consultations.list);
router.post("/", requireRole("patient", "sahayak"), validateBody(schemas.create), consultations.create);
router.get("/:id", loadConsultation, consultations.show);

router.patch("/:id/accept", requireRole("doctor"), loadConsultation, consultations.accept);
router.patch("/:id/start", requireRole("doctor"), loadConsultation, consultations.start);
router.patch("/:id/complete", requireRole("doctor"), validateBody(schemas.complete), loadConsultation, consultations.complete);
router.patch(
  "/:id/vitals",
  requireRole("doctor", "sahayak"),
  validateBody(schemas.vitals),
  loadConsultation,
  consultations.recordVitals
);
router.patch("/:id/cancel", validateBody(schemas.cancel), loadConsultation, consultations.cancel);
router.post("/:id/messages", messageLimiter, validateBody(schemas.message), loadConsultation, consultations.addMessage);

module.exports = router;
