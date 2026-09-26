const crypto = require("crypto");
const AppError = require("../utils/AppError");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function rotateCsrfToken(req) {
  req.session.csrfToken = crypto.randomBytes(24).toString("hex");
  return req.session.csrfToken;
}

function issueCsrfToken(req, res, next) {
  if (!req.session.csrfToken) rotateCsrfToken(req);
  next();
}

function tokensMatch(expected, received) {
  if (typeof received !== "string" || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const expected = req.session.csrfToken;
  if (!expected || !tokensMatch(expected, req.get("x-csrf-token"))) {
    return next(new AppError(403, "Your session has expired. Please refresh the page and try again."));
  }
  return next();
}

module.exports = { issueCsrfToken, verifyCsrf, rotateCsrfToken };
