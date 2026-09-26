const express = require("express");
const records = require("../controllers/recordController");
const { catalog: schemas } = require("../validators");
const { validateBody } = require("../middleware/validate");
const { requireAuth, requireRole, validateObjectId } = require("../middleware/auth");
const { recordUpload } = require("../middleware/upload");

const router = express.Router();

router.param("id", validateObjectId);

router.get("/", requireRole("patient"), records.list);
router.post("/", requireRole("patient"), recordUpload, validateBody(schemas.recordUpload), records.create);
router.get("/:id/file", requireAuth, records.file);
router.delete("/:id", requireRole("patient"), records.remove);

module.exports = router;
