const DEMO_PASSWORD = "Arogya@123";

const medicines = [
  { name: "Paracetamol", genericName: "Acetaminophen", localNames: { hi: "पैरासिटामोल", pa: "ਪੈਰਾਸੀਟਾਮੋਲ" }, manufacturer: "Cipla", dosageForm: "tablet", strength: "500mg", uses: "Fever, pain", isCommon: true },
  { name: "Crocin Advance", genericName: "Paracetamol", localNames: { hi: "क्रोसिन", pa: "ਕ੍ਰੋਸਿਨ" }, manufacturer: "GSK", dosageForm: "tablet", strength: "650mg", uses: "Fever, headache", isCommon: true },
  { name: "ORS", genericName: "Oral Rehydration Salts", localNames: { hi: "ओआरएस", pa: "ਓਆਰਐਸ" }, manufacturer: "Electral", dosageForm: "powder", strength: "21g", uses: "Dehydration, diarrhoea", isCommon: true },
  { name: "Cetirizine", genericName: "Cetirizine hydrochloride", localNames: { hi: "सेटिरिज़ीन", pa: "ਸੇਟੀਰਿਜ਼ੀਨ" }, manufacturer: "Dr. Reddy's", dosageForm: "tablet", strength: "10mg", uses: "Allergy, cold", isCommon: true },
  { name: "Combiflam", genericName: "Ibuprofen + Paracetamol", localNames: { hi: "कॉम्बिफ्लाम", pa: "ਕੌਮਬੀਫਲੈਮ" }, manufacturer: "Sanofi", dosageForm: "tablet", strength: "400mg/325mg", uses: "Pain, fever, inflammation", isCommon: true },
  { name: "Disprin", genericName: "Aspirin", localNames: { hi: "डिस्प्रिन", pa: "ਡਿਸਪ੍ਰਿਨ" }, manufacturer: "Reckitt", dosageForm: "tablet", strength: "350mg", uses: "Headache, pain", isCommon: true },
  { name: "Amoxicillin", genericName: "Amoxicillin", localNames: { hi: "एमोक्सिसिलिन", pa: "ਐਮੋਕਸੀਸਿਲਿਨ" }, manufacturer: "Sun Pharma", dosageForm: "capsule", strength: "250mg", uses: "Bacterial infections", requiresPrescription: true },
  { name: "Azithromycin", genericName: "Azithromycin", localNames: { hi: "एज़िथ्रोमाइसिन", pa: "ਐਜ਼ੀਥ੍ਰੋਮਾਈਸਿਨ" }, manufacturer: "Torrent", dosageForm: "tablet", strength: "500mg", uses: "Respiratory infections", requiresPrescription: true },
  { name: "Metformin", genericName: "Metformin hydrochloride", localNames: { hi: "मेटफॉर्मिन", pa: "ਮੈਟਫੋਰਮਿਨ" }, manufacturer: "USV", dosageForm: "tablet", strength: "500mg", uses: "Type 2 diabetes", requiresPrescription: true },
  { name: "Amlodipine", genericName: "Amlodipine besylate", localNames: { hi: "एम्लोडिपिन", pa: "ਐਮਲੋਡੀਪਿਨ" }, manufacturer: "Cipla", dosageForm: "tablet", strength: "5mg", uses: "High blood pressure", requiresPrescription: true },
  { name: "Pantoprazole", genericName: "Pantoprazole", localNames: { hi: "पैंटोप्राज़ोल", pa: "ਪੈਂਟੋਪ੍ਰਾਜ਼ੋਲ" }, manufacturer: "Alkem", dosageForm: "tablet", strength: "40mg", uses: "Acidity, ulcers" },
  { name: "Salbutamol Inhaler", genericName: "Salbutamol", localNames: { hi: "सालबुटामोल इनहेलर", pa: "ਸਾਲਬੁਟਾਮੋਲ ਇਨਹੇਲਰ" }, manufacturer: "Cipla", dosageForm: "inhaler", strength: "100mcg", uses: "Asthma, breathlessness", requiresPrescription: true },
  { name: "Iron Folic Acid", genericName: "Ferrous sulphate + Folic acid", localNames: { hi: "आयरन फोलिक एसिड", pa: "ਆਇਰਨ ਫੋਲਿਕ ਐਸਿਡ" }, manufacturer: "Govt. Supply", dosageForm: "tablet", strength: "100mg/0.5mg", uses: "Anaemia, pregnancy", isCommon: true },
  { name: "Cough Syrup (Benadryl)", genericName: "Diphenhydramine", localNames: { hi: "खांसी की दवा", pa: "ਖੰਘ ਦੀ ਦਵਾਈ" }, manufacturer: "J&J", dosageForm: "syrup", strength: "100ml", uses: "Cough, cold" },
];

const pharmacies = [
  { name: "Sharma Medical Store", ownerName: "Raj Kumar Sharma", phone: "+919876543210", address: "Main Market, near Gurudwara", village: "Nabha", district: "Patiala", openingHours: "8 AM – 10 PM" },
  { name: "City Pharmacy", ownerName: "Preet Singh", phone: "+919876543211", address: "Civil Hospital Road", village: "Nabha", district: "Patiala", isOpen24x7: true, openingHours: "Open 24 hours" },
  { name: "Wellness Pharmacy", ownerName: "Gurpreet Kaur", phone: "+919876543212", address: "Bus Stand Area", village: "Ghanaur", district: "Patiala", openingHours: "9 AM – 9 PM" },
  { name: "Jan Aushadhi Kendra", ownerName: "Mandeep Singh", phone: "+919876543213", address: "GT Road, opposite Block Office", village: "Rajpura", district: "Patiala", openingHours: "9 AM – 8 PM" },
  { name: "Health Plus Chemist", ownerName: "Simran Kaur", phone: "+919876543214", address: "Village Centre, near School", village: "Samana", district: "Patiala", openingHours: "8 AM – 9 PM" },
];

const inventory = [
  [0, "Paracetamol", 120, 15, 14], [0, "Crocin Advance", 40, 30, 10], [0, "ORS", 200, 12, 18], [0, "Disprin", 0, 18, 12],
  [0, "Cetirizine", 60, 20, 16], [0, "Metformin", 8, 45, 12], [0, "Amlodipine", 50, 38, 20],
  [1, "Paracetamol", 90, 16, 12], [1, "Amoxicillin", 25, 85, 9], [1, "Azithromycin", 30, 120, 11], [1, "Combiflam", 75, 35, 15],
  [1, "Salbutamol Inhaler", 6, 160, 8], [1, "Pantoprazole", 45, 60, 14], [1, "Cough Syrup (Benadryl)", 20, 95, 10],
  [2, "ORS", 150, 10, 20], [2, "Paracetamol", 80, 14, 9], [2, "Iron Folic Acid", 300, 5, 18], [2, "Crocin Advance", 30, 28, -1],
  [3, "Paracetamol", 200, 9, 16], [3, "Metformin", 120, 22, 18], [3, "Amlodipine", 100, 18, 20], [3, "Iron Folic Acid", 400, 3, 24],
  [3, "Cetirizine", 90, 12, 14], [3, "Pantoprazole", 80, 30, 12],
  [4, "Combiflam", 35, 36, 10], [4, "Disprin", 50, 17, 11], [4, "ORS", 60, 12, 13], [4, "Cough Syrup (Benadryl)", 9, 90, 7],
];

const users = {
  patients: [
    { name: "Ram Singh", email: "patient@arogya.demo", phone: "+919812345670", village: "Nabha", preferredLanguage: "pa",
      patientProfile: { dateOfBirth: "1980-04-12", gender: "male", bloodGroup: "B+", allergies: "Penicillin", chronicConditions: "Hypertension",
        emergencyContact: { name: "Sita Singh", phone: "+919812345671", relation: "Wife" } } },
    { name: "Sita Devi", email: "sita@arogya.demo", phone: "+919812345672", village: "Ghanaur", preferredLanguage: "hi",
      patientProfile: { dateOfBirth: "1987-09-03", gender: "female", bloodGroup: "O+", allergies: "", chronicConditions: "" } },
  ],
  sahayaks: [
    { name: "Priya Sharma", email: "sahayak@arogya.demo", phone: "+919812345680", village: "Nabha", preferredLanguage: "hi",
      sahayakProfile: { healthCenter: "Nabha Primary Health Centre", certification: "ASHA Certified (2021)",
        equipment: { stethoscope: true, bpMonitor: true, pulseOximeter: true, glucometer: false, ecg: true, thermometer: true } } },
  ],
  doctors: [
    { name: "Anjali Verma", email: "doctor@arogya.demo", phone: "+919812345690", village: "Patiala", preferredLanguage: "en",
      doctorProfile: { specialization: "general", qualification: "MBBS, MD (Internal Medicine)", licenseNumber: "PMC-45821", experienceYears: 12, consultationFee: 150, languages: ["en", "hi", "pa"], isAvailable: true } },
    { name: "Rajesh Kumar", email: "rajesh@arogya.demo", phone: "+919812345691", village: "Rajpura", preferredLanguage: "hi",
      doctorProfile: { specialization: "general", qualification: "MBBS", licenseNumber: "PMC-51277", experienceYears: 8, consultationFee: 120, languages: ["en", "hi"], isAvailable: true } },
    { name: "Meera Singh", email: "meera@arogya.demo", phone: "+919812345692", village: "Patiala", preferredLanguage: "pa",
      doctorProfile: { specialization: "pediatrics", qualification: "MBBS, DCH", licenseNumber: "PMC-39004", experienceYears: 15, consultationFee: 200, languages: ["hi", "pa"], isAvailable: true } },
    { name: "Harpreet Gill", email: "harpreet@arogya.demo", phone: "+919812345693", village: "Ludhiana", preferredLanguage: "pa",
      doctorProfile: { specialization: "cardiology", qualification: "MBBS, MD, DM (Cardiology)", licenseNumber: "PMC-28815", experienceYears: 18, consultationFee: 300, languages: ["en", "pa"], isAvailable: false } },
  ],
};

module.exports = { DEMO_PASSWORD, medicines, pharmacies, inventory, users };
