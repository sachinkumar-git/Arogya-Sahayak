const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { request, startApp, stopApp, send, signup, PASSWORD } = require("../helpers");

describe("authentication and profiles", () => {
  let app;

  before(async () => {
    app = await startApp();
  });

  after(stopApp);

  it("rejects state-changing requests without a CSRF token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "x@example.com", password: "x" });
    assert.equal(res.status, 403);
  });

  it("sends security headers", async () => {
    const res = await request(app).get("/api/session");
    assert.equal(res.headers["referrer-policy"], "same-origin");
    assert.match(res.headers["content-security-policy"], /script-src 'self'/);
    assert.equal(res.headers["x-powered-by"], undefined);
  });

  it("describes an anonymous session with reference data", async () => {
    const res = await request(app).get("/api/session");
    assert.equal(res.body.user, null);
    assert.match(res.body.csrfToken, /^[a-f0-9]{48}$/);
    assert.ok(res.body.meta.specialties.some((s) => s.key === "general"));
  });

  it("validates signup input with field errors", async () => {
    const agent = request.agent(app);
    const res = await send(agent, "post", "/api/auth/signup", { name: "A", email: "bad", password: "short", role: "admin" });
    assert.equal(res.status, 400);
    assert.equal(res.body.errors.name, "Full name length must be at least 2 characters long");
    assert.equal(res.body.errors.email, "Email must be a valid email");
    assert.equal(res.body.errors.password, "Password length must be at least 8 characters long");
    assert.match(res.body.errors.role, /Role must be one of/);
  });

  it("requires professional details for doctors", async () => {
    const agent = request.agent(app);
    const res = await send(agent, "post", "/api/auth/signup", {
      name: "Dr Test",
      email: "drtest@example.com",
      password: PASSWORD,
      role: "doctor",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.errors.doctor, "doctor is required");
  });

  it("signs up a patient, normalising their phone number", async () => {
    const { agent, user } = await signup(app, { name: "Ram Singh", email: "Ram@Example.com", phone: "+91 98123-45670" });
    assert.equal(user.email, "ram@example.com");
    assert.equal(user.role, "patient");
    assert.equal(user.phone, "+919812345670");
    assert.equal((await agent.get("/api/session")).body.user.name, "Ram Singh");
  });

  it("rejects duplicate emails", async () => {
    const agent = request.agent(app);
    const res = await send(agent, "post", "/api/auth/signup", {
      name: "Another Ram",
      email: "ram@example.com",
      password: PASSWORD,
      role: "patient",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.errors.email, "An account with this email already exists.");
  });

  it("logs in, rotates the CSRF token, and logs out", async () => {
    const agent = request.agent(app);
    const before = (await agent.get("/api/session")).body.csrfToken;

    const bad = await send(agent, "post", "/api/auth/login", { email: "ram@example.com", password: "wrong-password" });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error, "Incorrect email or password.");

    const good = await send(agent, "post", "/api/auth/login", { email: "RAM@example.com", password: PASSWORD });
    assert.equal(good.status, 200);
    assert.notEqual(good.body.csrfToken, before);
    assert.equal((await agent.get("/api/records")).status, 200);

    await send(agent, "post", "/api/auth/logout");
    assert.equal((await agent.get("/api/records")).status, 401);
  });

  it("updates the patient's own medical profile but not other roles' sections", async () => {
    const { agent } = await signup(app, { name: "Sita Devi", email: "sita@example.com" });
    const res = await send(agent, "patch", "/api/profile", {
      name: "Sita Devi",
      village: "Ghanaur",
      patientProfile: { bloodGroup: "O+", allergies: "Dust", emergencyContact: { name: "Mohan", phone: "9812345679", relation: "Husband" } },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.patientProfile.bloodGroup, "O+");
    assert.equal(res.body.user.patientProfile.emergencyContact.name, "Mohan");

    const wrong = await send(agent, "patch", "/api/profile", { name: "Sita Devi", doctorProfile: { consultationFee: 1 } });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.body.error, "Those profile details don't apply to your account type.");
  });

  it("persists the preferred language", async () => {
    const { agent } = await signup(app, { name: "Gurpreet Kaur", email: "gurpreet@example.com" });
    const res = await send(agent, "patch", "/api/profile/language", { preferredLanguage: "pa" });
    assert.equal(res.body.user.preferredLanguage, "pa");
    const invalid = await send(agent, "patch", "/api/profile/language", { preferredLanguage: "fr" });
    assert.equal(invalid.status, 400);
  });

  it("restricts role-only endpoints", async () => {
    const { agent } = await signup(app, { name: "Patient Only", email: "only@example.com" });
    const res = await send(agent, "patch", "/api/profile/availability", { isAvailable: false });
    assert.equal(res.status, 403);
    assert.equal((await agent.get("/api/patients/lookup?q=only@example.com")).status, 403);
  });

  it("returns a JSON 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/definitely-not-here");
    assert.equal(res.status, 404);
    assert.equal(res.body.error, "We couldn't find what you were looking for.");
  });
});
