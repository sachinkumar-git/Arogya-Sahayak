const express = require("express");
const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const consultationRoutes = require("./consultations");
const recordRoutes = require("./records");
const session = require("../controllers/sessionController");
const directory = require("../controllers/directoryController");
const catalog = require("../controllers/catalogController");
const { catalog: schemas } = require("../validators");
const { validateQuery } = require("../middleware/validate");
const { requireAuth, requireRole, validateObjectId } = require("../middleware/auth");
const { notFound } = require("../middleware/errorHandler");

const router = express.Router();

router.param("id", validateObjectId);

router.get("/health", (req, res) => res.json({ ok: true }));
router.get("/session", session.show);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/consultations", consultationRoutes);
router.use("/records", recordRoutes);

router.get("/dashboard", requireAuth, catalog.dashboard);
router.get("/doctors", requireAuth, validateQuery(schemas.doctorSearch), directory.listDoctors);
router.get("/patients/lookup", requireRole("sahayak", "doctor"), validateQuery(schemas.patientLookup), directory.lookupPatient);
router.get("/patients/:id/records", requireRole("sahayak", "doctor"), directory.patientRecords);

router.get("/medicines", validateQuery(schemas.medicineSearch), catalog.searchMedicines);
router.get("/medicines/:id", catalog.medicineAvailability);

router.use(notFound);

module.exports = router;
