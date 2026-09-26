const multer = require("multer");
const { MAX_UPLOAD_BYTES, UPLOAD_MIME_TYPES } = require("../constants/records");

const TYPE_ERROR = "Reports must be a PDF, JPG, PNG or WebP file.";

const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 10 },
  fileFilter(req, file, cb) {
    if (UPLOAD_MIME_TYPES[file.mimetype]) return cb(null, true);
    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    err.message = TYPE_ERROR;
    return cb(err);
  },
}).single("file");

const UPLOAD_ERRORS = {
  LIMIT_FILE_SIZE: `Files must be ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB or smaller.`,
  LIMIT_FILE_COUNT: "Please upload one file at a time.",
};

function recordUpload(req, res, next) {
  parser(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      req.uploadError = err.message === TYPE_ERROR ? TYPE_ERROR : UPLOAD_ERRORS[err.code] || TYPE_ERROR;
      req.body = req.body || {};
      req.file = undefined;
      return next();
    }
    return next(err);
  });
}

module.exports = { recordUpload };
