const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { request, startApp, stopApp, csrfToken, send, signup, TINY_PDF } = require("../helpers");
const Medicine = require("../../src/models/Medicine");
const Pharmacy = require("../../src/models/Pharmacy");
const HealthRecord = require("../../src/models/HealthRecord");
const { addDays } = require("../../src/utils/dates");

async function uploadRecord(agent, fields, file) {
  const token = await csrfToken(agent);
  let req = agent.post("/api/records").set("X-CSRF-Token", token);
  for (const [key, value] of Object.entries(fields)) req = req.field(key, value);
  if (file) req = req.attach("file", file.buffer, { filename: file.name, contentType: file.type });
  return req;
}

describe("health records and medicine finder", () => {
  let app;
  let patient;
  let stranger;
  let paracetamol;

  before(async () => {
    app = await startApp();
    patient = await signup(app, { name: "Ram Singh", email: "ram@example.com" });
    stranger = await signup(app, { name: "Nosy Neighbour", email: "nosy@example.com" });

    const [para, ors, amox] = await Medicine.create([
      { name: "Paracetamol", genericName: "Acetaminophen", dosageForm: "tablet", strength: "500mg", uses: "Fever", isCommon: true },
      { name: "ORS", dosageForm: "powder", uses: "Dehydration", isCommon: true },
      { name: "Amoxicillin", dosageForm: "capsule", uses: "Infections", requiresPrescription: true },
    ]);
    paracetamol = para;
    const future = addDays(new Date(), 180);
    await Pharmacy.create([
      { name: "Cheap Chemist", phone: "+911", address: "Main road", village: "Nabha",
        inventory: [{ medicine: para._id, quantity: 50, price: 12, expiryDate: future }] },
      { name: "Low Stock Store", phone: "+912", address: "Bus stand", village: "Nabha",
        inventory: [{ medicine: para._id, quantity: 4, price: 10, expiryDate: future }] },
      { name: "Expired Pharmacy", phone: "+913", address: "Old market", village: "Samana",
        inventory: [{ medicine: para._id, quantity: 100, price: 5, expiryDate: addDays(new Date(), -3) }, { medicine: ors._id, quantity: 0, price: 10, expiryDate: future }] },
      { name: "Closed Pharmacy", phone: "+914", address: "Nowhere", village: "Nabha", isActive: false,
        inventory: [{ medicine: amox._id, quantity: 10, price: 80, expiryDate: future }] },
    ]);
  });

  after(stopApp);

  it("lists common medicines publicly with a stock summary", async () => {
    const res = await request(app).get("/api/medicines");
    assert.deepEqual(res.body.medicines.map((m) => m.name), ["ORS", "Paracetamol"]);
    const para = res.body.medicines.find((m) => m.name === "Paracetamol");
    assert.equal(para.pharmaciesInStock, 2);
    assert.equal(para.lowestPrice, 10);
    assert.equal(res.body.medicines.find((m) => m.name === "ORS").pharmaciesInStock, 0);
  });

  it("searches by name or generic name and treats regex characters literally", async () => {
    assert.deepEqual((await request(app).get("/api/medicines?q=acetamin")).body.medicines.map((m) => m.name), ["Paracetamol"]);
    assert.deepEqual((await request(app).get("/api/medicines?q=.*")).body.medicines, []);
  });

  it("ranks availability, hides expired stock and inactive pharmacies", async () => {
    const res = await request(app).get(`/api/medicines/${paracetamol._id}`);
    assert.deepEqual(
      res.body.pharmacies.map((p) => [p.name, p.status, p.price]),
      [["Cheap Chemist", "in_stock", 12], ["Low Stock Store", "low_stock", 10], ["Expired Pharmacy", "out_of_stock", null]]
    );
    const amox = await Medicine.findOne({ name: "Amoxicillin" });
    assert.deepEqual((await request(app).get(`/api/medicines/${amox._id}`)).body.pharmacies, []);
  });

  it("validates uploads and rejects unsupported files", async () => {
    const missing = await uploadRecord(patient.agent, { type: "lab_report" });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.errors.title, "Title is required");

    const wrongType = await uploadRecord(patient.agent, { type: "lab_report", title: "Blood test" }, {
      buffer: Buffer.from("MZ"), name: "virus.exe", type: "application/x-msdownload",
    });
    assert.equal(wrongType.status, 400);
    assert.equal(wrongType.body.errors.file, "Reports must be a PDF, JPG, PNG or WebP file.");

    const systemType = await uploadRecord(patient.agent, { type: "consultation", title: "Fake consult" });
    assert.equal(systemType.status, 400);
  });

  let recordId;

  it("uploads a lab report that only the patient (and their care team) can download", async () => {
    const res = await uploadRecord(patient.agent, { type: "lab_report", title: "CBC blood test" }, {
      buffer: TINY_PDF, name: "../../cbc report.pdf", type: "application/pdf",
    });
    assert.equal(res.status, 201);
    recordId = res.body.record._id;
    assert.equal(res.body.record.hasFile, true);
    assert.equal(res.body.record.file, undefined);

    const download = await patient.agent.get(`/api/records/${recordId}/file`);
    assert.equal(download.status, 200);
    assert.equal(download.headers["content-type"], "application/pdf");
    assert.match(download.headers["content-disposition"], /attachment; filename="cbc report.pdf"/);

    assert.equal((await stranger.agent.get(`/api/records/${recordId}/file`)).status, 404);
    assert.equal((await request(app).get(`/api/records/${recordId}/file`)).status, 401);
  });

  it("lets patients delete only their own uploads", async () => {
    assert.equal((await send(stranger.agent, "delete", `/api/records/${recordId}`)).status, 404);
    const clinical = await HealthRecord.create({
      patient: patient.user._id, type: "vitals", title: "Vitals check", vitals: { pulse: 80 }, recordedBy: stranger.user._id,
    });
    const blocked = await send(patient.agent, "delete", `/api/records/${clinical._id}`);
    assert.equal(blocked.status, 403);

    const removed = await send(patient.agent, "delete", `/api/records/${recordId}`);
    assert.equal(removed.status, 200);
    assert.equal(await HealthRecord.exists({ _id: recordId }), null);
  });
});
