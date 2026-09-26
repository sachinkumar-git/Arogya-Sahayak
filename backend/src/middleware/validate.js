const OPTIONS = {
  abortEarly: false,
  stripUnknown: true,
  errors: { wrap: { label: false } },
  messages: { "string.empty": "{#label} is required" },
};

function toFieldErrors(details) {
  const errors = {};
  for (const detail of details) {
    const key = detail.path.join(".");
    if (!errors[key]) errors[key] = detail.message;
  }
  return errors;
}

function validator(source) {
  return (schema, { message } = {}) =>
    (req, res, next) => {
      const { value, error } = schema.validate(req[source] || {}, OPTIONS);
      const errors = error ? toFieldErrors(error.details) : {};
      if (req.uploadError) errors.file = req.uploadError;

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: message || Object.values(errors)[0], errors });
      }

      if (source === "query") req.validQuery = value;
      else req[source] = value;
      return next();
    };
}

module.exports = { validateBody: validator("body"), validateQuery: validator("query") };
