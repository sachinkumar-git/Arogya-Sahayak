const RECORD_TYPES = ["consultation", "vitals", "lab_report", "prescription", "vaccination", "imaging", "other"];

const UPLOADABLE_RECORD_TYPES = ["lab_report", "prescription", "vaccination", "imaging", "other"];

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_MIME_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

module.exports = { RECORD_TYPES, UPLOADABLE_RECORD_TYPES, MAX_UPLOAD_BYTES, UPLOAD_MIME_TYPES };
