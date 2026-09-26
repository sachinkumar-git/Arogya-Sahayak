const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");
const AppError = require("../utils/AppError");
const { escapeRegex } = require("../utils/text");
const { startOfToday } = require("../utils/dates");
const { LOW_STOCK_THRESHOLD } = require("../constants/medicines");

function stockStatus(stock, today = startOfToday()) {
  if (!stock) return "out_of_stock";
  if (stock.expiryDate < today) return "expired";
  if (stock.quantity <= 0) return "out_of_stock";
  if (stock.quantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

const isSellable = (status) => status === "in_stock" || status === "low_stock";

async function search(query) {
  const filter = {};
  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ name: pattern }, { genericName: pattern }, { uses: pattern }, { "localNames.hi": pattern }, { "localNames.pa": pattern }];
  } else {
    filter.isCommon = true;
  }
  const medicines = await Medicine.find(filter).sort({ name: 1 }).limit(24).lean();
  if (medicines.length === 0) return [];

  const ids = medicines.map((m) => m._id);
  const pharmacies = await Pharmacy.find({ isActive: true, "inventory.medicine": { $in: ids } })
    .select("inventory")
    .lean();

  const today = startOfToday();
  const summary = new Map(ids.map((id) => [String(id), { pharmaciesInStock: 0, lowestPrice: null }]));
  for (const pharmacy of pharmacies) {
    for (const stock of pharmacy.inventory) {
      const entry = summary.get(String(stock.medicine));
      if (!entry || !isSellable(stockStatus(stock, today))) continue;
      entry.pharmaciesInStock += 1;
      entry.lowestPrice = entry.lowestPrice === null ? stock.price : Math.min(entry.lowestPrice, stock.price);
    }
  }

  return medicines.map((medicine) => ({ ...medicine, ...summary.get(String(medicine._id)) }));
}

async function availability(medicineId) {
  const medicine = await Medicine.findById(medicineId).lean();
  if (!medicine) throw new AppError(404, "We couldn't find that medicine.");

  const pharmacies = await Pharmacy.find({ isActive: true }).lean();
  const today = startOfToday();
  const rank = { in_stock: 0, low_stock: 1, out_of_stock: 2, expired: 2 };

  const results = pharmacies
    .map((pharmacy) => {
      const batches = pharmacy.inventory.filter((s) => s.medicine.equals(medicine._id));
      const sellable = batches.filter((s) => isSellable(stockStatus(s, today))).sort((a, b) => a.price - b.price);
      const stock = sellable[0] || batches[0];
      const status = stockStatus(stock, today);
      return {
        _id: pharmacy._id,
        name: pharmacy.name,
        phone: pharmacy.phone,
        address: pharmacy.address,
        village: pharmacy.village,
        district: pharmacy.district,
        openingHours: pharmacy.openingHours,
        isOpen24x7: pharmacy.isOpen24x7,
        status: status === "expired" ? "out_of_stock" : status,
        price: stock && isSellable(status) ? stock.price : null,
        quantity: stock && isSellable(status) ? stock.quantity : 0,
        stocked: batches.length > 0,
      };
    })
    .filter((p) => p.stocked)
    .sort((a, b) => rank[a.status] - rank[b.status] || (a.price ?? Infinity) - (b.price ?? Infinity))
    .map(({ stocked: _stocked, ...rest }) => rest);

  return { medicine, pharmacies: results };
}

module.exports = { search, availability, stockStatus };
