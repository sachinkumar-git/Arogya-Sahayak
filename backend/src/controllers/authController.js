const passport = require("passport");
const userService = require("../services/userService");
const { serializeUser } = require("../utils/serialize");
const { rotateCsrfToken } = require("../middleware/csrf");

function logIn(req, user, done) {
  req.login(user, (err) => {
    if (err) return done(err);
    rotateCsrfToken(req);
    return done();
  });
}

async function signup(req, res, next) {
  const user = await userService.register(req.body);
  logIn(req, user, (err) => {
    if (err) return next(err);
    return res.status(201).json({ user: serializeUser(user), csrfToken: req.session.csrfToken });
  });
}

function login(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || "Incorrect email or password." });
    return logIn(req, user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({ user: serializeUser(user), csrfToken: req.session.csrfToken });
    });
  })(req, res, next);
}

function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    return req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("arogya.sid");
      return res.json({ ok: true });
    });
  });
}

module.exports = { signup, login, logout };
