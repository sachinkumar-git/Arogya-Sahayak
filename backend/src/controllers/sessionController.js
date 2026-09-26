const { ROLES, LANGUAGES, GENDERS, BLOOD_GROUPS, EQUIPMENT } = require("../constants/users");
const { SPECIALTIES, MODES, PRIORITIES, MAX_DAYS_IN_ADVANCE } = require("../constants/consultations");
const { RECORD_TYPES, UPLOADABLE_RECORD_TYPES, MAX_UPLOAD_BYTES, UPLOAD_MIME_TYPES } = require("../constants/records");
const { serializeUser } = require("../utils/serialize");

const META = {
  roles: ROLES,
  languages: LANGUAGES,
  genders: GENDERS,
  bloodGroups: BLOOD_GROUPS,
  equipment: EQUIPMENT,
  specialties: SPECIALTIES,
  consultationModes: MODES,
  priorities: PRIORITIES,
  maxDaysInAdvance: MAX_DAYS_IN_ADVANCE,
  recordTypes: RECORD_TYPES,
  uploadableRecordTypes: UPLOADABLE_RECORD_TYPES,
  maxUploadBytes: MAX_UPLOAD_BYTES,
  uploadMimeTypes: Object.keys(UPLOAD_MIME_TYPES),
};

function show(req, res) {
  res.json({
    user: req.user ? serializeUser(req.user) : null,
    csrfToken: req.session.csrfToken,
    meta: META,
  });
}

module.exports = { show };
