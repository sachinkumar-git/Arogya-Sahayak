const SPECIALTIES = [
  { key: "general", label: "General Medicine" },
  { key: "pediatrics", label: "Child Care" },
  { key: "cardiology", label: "Heart Problems" },
  { key: "orthopedics", label: "Bone & Joint" },
  { key: "psychiatry", label: "Mental Health" },
  { key: "ophthalmology", label: "Eye Care" },
  { key: "gynecology", label: "Women's Health" },
  { key: "dermatology", label: "Skin Care" },
];
const SPECIALTY_KEYS = SPECIALTIES.map((s) => s.key);

const MODES = ["video", "audio", "chat"];
const PRIORITIES = ["normal", "high", "emergency"];
const STATUSES = ["scheduled", "waiting", "in_progress", "completed", "cancelled"];

const OPEN_STATUSES = ["scheduled", "waiting", "in_progress"];
const CANCELLABLE_STATUSES = ["scheduled", "waiting"];
const STARTABLE_STATUSES = ["scheduled", "waiting"];

const SLOT_MINUTES = 15;
const MAX_DAYS_IN_ADVANCE = 30;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_PRESCRIPTION_ITEMS = 15;

const PRIORITY_RANK = { emergency: 0, high: 1, normal: 2 };

module.exports = {
  SPECIALTIES,
  SPECIALTY_KEYS,
  MODES,
  PRIORITIES,
  STATUSES,
  OPEN_STATUSES,
  CANCELLABLE_STATUSES,
  STARTABLE_STATUSES,
  SLOT_MINUTES,
  MAX_DAYS_IN_ADVANCE,
  MAX_MESSAGE_LENGTH,
  MAX_PRESCRIPTION_ITEMS,
  PRIORITY_RANK,
};
