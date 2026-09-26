const mongoose = require("mongoose");
const { DOSAGE_FORMS } = require("../constants/medicines");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    genericName: { type: String, trim: true, maxlength: 80 },
    localNames: { hi: String, pa: String },
    manufacturer: { type: String, trim: true, maxlength: 80 },
    dosageForm: { type: String, enum: DOSAGE_FORMS, required: true },
    strength: { type: String, trim: true, maxlength: 30 },
    uses: { type: String, trim: true, maxlength: 200 },
    requiresPrescription: { type: Boolean, default: false },
    isCommon: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicineSchema.index({ name: "text", genericName: "text", uses: "text" });

module.exports = mongoose.model("Medicine", medicineSchema);
