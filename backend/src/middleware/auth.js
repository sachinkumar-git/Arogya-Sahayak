const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return next(new AppError(401, "Please log in to continue."));
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) return next(new AppError(401, "Please log in to continue."));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Your account doesn't have access to this."));
    }
    return next();
  };
}

function validateObjectId(req, res, next, value) {
  if (!mongoose.isValidObjectId(value)) return next(new AppError(404, "We couldn't find what you were looking for."));
  return next();
}

module.exports = { requireAuth, requireRole, validateObjectId };
