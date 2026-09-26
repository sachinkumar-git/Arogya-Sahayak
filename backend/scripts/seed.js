const env = require("../src/config/env");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");
const User = require("../src/models/User");
const Medicine = require("../src/models/Medicine");
const Pharmacy = require("../src/models/Pharmacy");
const Consultation = require("../src/models/Consultation");
const HealthRecord = require("../src/models/HealthRecord");
const { addDays } = require("../src/utils/dates");
const data = require("./seed-data");

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

async function createUsers() {
  const create = (role) => (fields) => User.register(new User({ ...fields, role }), data.DEMO_PASSWORD);
  return {
    patients: await Promise.all(data.users.patients.map(create("patient"))),
    sahayaks: await Promise.all(data.users.sahayaks.map(create("sahayak"))),
    doctors: await Promise.all(data.users.doctors.map(create("doctor"))),
  };
}

async function createCatalog() {
  const medicines = await Medicine.insertMany(data.medicines);
  const byName = new Map(medicines.map((m) => [m.name, m._id]));
  const now = new Date();

  const pharmacies = data.pharmacies.map((pharmacy, index) => ({
    ...pharmacy,
    inventory: data.inventory
      .filter(([pharmacyIndex]) => pharmacyIndex === index)
      .map(([, medicine, quantity, price, months], i) => ({
        medicine: byName.get(medicine),
        quantity,
        price,
        expiryDate: addMonths(now, months),
        batchNumber: `B${index + 1}${String(i + 1).padStart(3, "0")}`,
      })),
  }));
  await Pharmacy.insertMany(pharmacies);
  return medicines.length;
}

async function createHistory({ patients, sahayaks, doctors }) {
  const [ram, sita] = patients;
  const [priya] = sahayaks;
  const [anjali] = doctors;
  const now = new Date();
  const vitals = { systolic: 142, diastolic: 92, pulse: 84, temperature: 98.8, spo2: 97, weight: 72, recordedAt: addDays(now, -14), recordedBy: priya._id };

  const past = await Consultation.create({
    patient: ram._id, doctor: anjali._id, sahayak: priya._id, specialty: "general", mode: "video", status: "completed",
    complaint: "Headache and dizziness", symptoms: "Morning headaches for a week, occasional dizziness.", vitals,
    fee: 150, createdAt: addDays(now, -14), startedAt: addDays(now, -14), completedAt: addDays(now, -14),
    diagnosis: "Stage 1 hypertension, poorly controlled.",
    prescription: [{ medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily (morning)", duration: "30 days" }],
    advice: "Reduce salt intake, walk 30 minutes daily, recheck BP in 2 weeks.",
  });
  await HealthRecord.create([
    { patient: ram._id, consultation: past._id, type: "vitals", title: "Vitals check", vitals, recordedBy: priya._id, recordedAt: vitals.recordedAt },
    { patient: ram._id, consultation: past._id, type: "consultation", title: `Consultation with Dr. ${anjali.name}`, notes: past.diagnosis, recordedBy: anjali._id, recordedAt: past.completedAt },
    { patient: ram._id, type: "vaccination", title: "Tetanus booster (Td)", notes: "Given at Nabha PHC.", recordedBy: ram._id, recordedAt: addDays(now, -120) },
  ]);

  const sitaVitals = { systolic: 118, diastolic: 76, pulse: 96, temperature: 101.4, spo2: 98, recordedAt: now, recordedBy: priya._id };
  const waiting = await Consultation.create({
    patient: sita._id, sahayak: priya._id, specialty: "general", mode: "video", status: "waiting", priority: "high",
    complaint: "High fever for 3 days", symptoms: "Fever with chills, body ache, reduced appetite.", vitals: sitaVitals, fee: 0,
  });
  await HealthRecord.create({ patient: sita._id, consultation: waiting._id, type: "vitals", title: "Vitals check", vitals: sitaVitals, recordedBy: priya._id, recordedAt: now });
}

async function seed() {
  if (env.isProduction) throw new Error("Refusing to seed a production database.");

  const connection = await connectDatabase(env.mongoUrl);
  console.log(`[seed] Resetting ${connection.name} …`);
  await Promise.all([User, Medicine, Pharmacy, Consultation, HealthRecord].map((model) => model.deleteMany({})));
  await Promise.all([User, Medicine, Pharmacy, Consultation, HealthRecord].map((model) => model.syncIndexes()));

  const medicineCount = await createCatalog();
  const users = await createUsers();
  await createHistory(users);

  console.log(`[seed] ${medicineCount} medicines, ${data.pharmacies.length} pharmacies, ${Object.values(users).flat().length} users.`);
  console.log(`[seed] Demo logins (password "${data.DEMO_PASSWORD}"):`);
  console.log("        patient@arogya.demo · sahayak@arogya.demo · doctor@arogya.demo");
}

seed()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
