const ROLES = ["patient", "sahayak", "doctor"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];
const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

const GENDERS = ["female", "male", "other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EQUIPMENT = [
  { key: "stethoscope", label: "Digital Stethoscope" },
  { key: "bpMonitor", label: "Blood Pressure Monitor" },
  { key: "pulseOximeter", label: "Pulse Oximeter" },
  { key: "glucometer", label: "Glucometer" },
  { key: "ecg", label: "Portable ECG" },
  { key: "thermometer", label: "Digital Thermometer" },
];
const EQUIPMENT_KEYS = EQUIPMENT.map((e) => e.key);

module.exports = { ROLES, LANGUAGES, LANGUAGE_CODES, GENDERS, BLOOD_GROUPS, EQUIPMENT, EQUIPMENT_KEYS };
