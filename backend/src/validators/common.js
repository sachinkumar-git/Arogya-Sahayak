const Joi = require("joi");

const text = (label, min, max) => Joi.string().trim().min(min).max(max).required().label(label);
const optionalText = (label, max) => Joi.string().trim().max(max).allow("").label(label);
const phone = (label = "Phone number") =>
  Joi.string()
    .trim()
    .pattern(/^\+?[0-9][0-9\s-]{8,16}$/)
    .messages({ "string.pattern.base": `${label} must be a valid phone number` })
    .label(label);
const objectId = (label) =>
  Joi.string()
    .hex()
    .length(24)
    .messages({ "string.hex": `${label} is invalid`, "string.length": `${label} is invalid` })
    .label(label);
const optional = (schema, fallback = null) => schema.empty("").failover(fallback);
const nullable = (schema) => schema.empty("").allow(null);

module.exports = { text, optionalText, phone, objectId, optional, nullable };
