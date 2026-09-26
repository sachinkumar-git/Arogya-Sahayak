const crypto = require("crypto");
const mongoose = require("mongoose");
const vitalsSchema = require("./schemas/vitals");
const {
  SPECIALTY_KEYS,
  MODES,
  PRIORITIES,
  STATUSES,
  OPEN_STATUSES,
  CANCELLABLE_STATUSES,
  MAX_MESSAGE_LENGTH,
} = require("../constants/consultations");
const { ROLES } = require("../constants/users");

const { ObjectId } = mongoose.Schema.Types;

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true, maxlength: 80 },
    dosage: { type: String, trim: true, maxlength: 40 },
    frequency: { type: String, trim: true, maxlength: 60 },
    duration: { type: String, trim: true, maxlength: 40 },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: { type: ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: MAX_MESSAGE_LENGTH },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const consultationSchema = new mongoose.Schema(
  {
    patient: { type: ObjectId, ref: "User", required: true, index: true },
    doctor: { type: ObjectId, ref: "User", default: null, index: true },
    sahayak: { type: ObjectId, ref: "User", default: null, index: true },
    specialty: { type: String, enum: SPECIALTY_KEYS, required: true },
    mode: { type: String, enum: MODES, required: true },
    status: { type: String, enum: STATUSES, default: "waiting" },
    priority: { type: String, enum: PRIORITIES, default: "normal" },
    complaint: { type: String, required: true, trim: true, maxlength: 200 },
    symptoms: { type: String, trim: true, maxlength: 2000 },
    vitals: vitalsSchema,
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ROLES },
    cancelReason: { type: String, trim: true, maxlength: 300 },
    diagnosis: { type: String, trim: true, maxlength: 1000 },
    prescription: { type: [prescriptionItemSchema], default: [] },
    advice: { type: String, trim: true, maxlength: 1000 },
    followUpDate: Date,
    fee: { type: Number, min: 0, default: 0 },
    roomId: { type: String, default: () => crypto.randomBytes(12).toString("hex"), select: false },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

consultationSchema.index({ status: 1, doctor: 1, specialty: 1 });
consultationSchema.index({ doctor: 1, scheduledAt: 1 });

const idOf = (ref) => (ref && ref._id ? ref._id : ref);

consultationSchema.methods.roleOf = function roleOf(user) {
  if (idOf(this.patient)?.equals(user._id)) return "patient";
  if (idOf(this.doctor)?.equals(user._id)) return "doctor";
  if (idOf(this.sahayak)?.equals(user._id)) return "sahayak";
  return null;
};

consultationSchema.methods.involves = function involves(user) {
  return this.roleOf(user) !== null;
};

consultationSchema.virtual("isOpen").get(function isOpen() {
  return OPEN_STATUSES.includes(this.status);
});

consultationSchema.virtual("isCancellable").get(function isCancellable() {
  return CANCELLABLE_STATUSES.includes(this.status);
});

module.exports = mongoose.model("Consultation", consultationSchema);
