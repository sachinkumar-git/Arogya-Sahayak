const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const stockSchema = new mongoose.Schema(
  {
    medicine: { type: ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, min: 0, required: true },
    price: { type: Number, min: 0, required: true },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String, trim: true },
  },
  { _id: false }
);

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ownerName: { type: String, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    village: { type: String, required: true, trim: true, maxlength: 60 },
    district: { type: String, trim: true, maxlength: 60 },
    openingHours: { type: String, trim: true, maxlength: 60 },
    isOpen24x7: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    inventory: { type: [stockSchema], default: [] },
  },
  { timestamps: true }
);

pharmacySchema.index({ "inventory.medicine": 1, isActive: 1 });

module.exports = mongoose.model("Pharmacy", pharmacySchema);
