export type Role = "patient" | "sahayak" | "doctor";
export type LanguageCode = "en" | "hi" | "pa";
export type ConsultationMode = "video" | "audio" | "chat";
export type Priority = "normal" | "high" | "emergency";
export type ConsultationStatus = "scheduled" | "waiting" | "in_progress" | "completed" | "cancelled";
export type RecordType = "consultation" | "vitals" | "lab_report" | "prescription" | "vaccination" | "imaging" | "other";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface PatientProfile {
  dateOfBirth?: string | null;
  gender?: "female" | "male" | "other" | null;
  bloodGroup?: string | null;
  allergies?: string;
  chronicConditions?: string;
  emergencyContact?: { name?: string; phone?: string; relation?: string };
}

export interface DoctorProfile {
  specialization: string;
  qualification?: string;
  licenseNumber?: string;
  experienceYears: number;
  consultationFee: number;
  languages: LanguageCode[];
  isAvailable: boolean;
}

export type Equipment = Record<string, boolean>;

export interface SahayakProfile {
  healthCenter?: string;
  certification?: string;
  equipment: Equipment;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  village: string;
  preferredLanguage: LanguageCode;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
  sahayakProfile?: SahayakProfile;
}

export interface Option {
  key: string;
  label: string;
}

export interface Meta {
  roles: Role[];
  languages: { code: LanguageCode; label: string }[];
  genders: string[];
  bloodGroups: string[];
  equipment: Option[];
  specialties: Option[];
  consultationModes: ConsultationMode[];
  priorities: Priority[];
  maxDaysInAdvance: number;
  recordTypes: RecordType[];
  uploadableRecordTypes: RecordType[];
  maxUploadBytes: number;
  uploadMimeTypes: string[];
}

export interface SessionData {
  user: User | null;
  csrfToken: string;
  meta: Meta;
}

export interface DoctorSummary {
  _id: string;
  name: string;
  village?: string;
  doctorProfile: Omit<DoctorProfile, "licenseNumber">;
}

export interface PatientSummary {
  _id: string;
  name: string;
  phone: string;
  village: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  allergies: string;
  chronicConditions: string;
}

export interface SahayakSummary {
  _id: string;
  name: string;
  phone: string;
  healthCenter: string;
}

export interface Vitals {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  bloodSugar?: number;
  weight?: number;
  recordedAt?: string;
}

export interface PrescriptionItem {
  medicine: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface Message {
  _id: string;
  body: string;
  createdAt: string;
  sender: { _id: string; name: string; role: Role };
}

export interface Consultation {
  _id: string;
  patient: PatientSummary;
  doctor: DoctorSummary | null;
  sahayak: SahayakSummary | null;
  specialty: string;
  mode: ConsultationMode;
  status: ConsultationStatus;
  priority: Priority;
  complaint: string;
  symptoms?: string;
  vitals?: Vitals;
  scheduledAt?: string | null;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: Role;
  cancelReason?: string;
  diagnosis?: string;
  prescription: PrescriptionItem[];
  advice?: string;
  followUpDate?: string | null;
  fee: number;
  messages?: Message[];
  isOpen: boolean;
  isCancellable: boolean;
  viewerRole: Role | null;
  videoRoomUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  _id: string;
  type: RecordType;
  title: string;
  notes?: string;
  vitals?: Vitals;
  hasFile: boolean;
  recordedAt: string;
  recordedBy: { _id: string; name: string; role: Role };
  consultation?: {
    _id: string;
    specialty: string;
    diagnosis?: string;
    prescription: PrescriptionItem[];
    advice?: string;
    followUpDate?: string | null;
    doctor?: { _id: string; name: string };
  } | null;
}

export interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  localNames?: { hi?: string; pa?: string };
  manufacturer?: string;
  dosageForm: string;
  strength?: string;
  uses?: string;
  requiresPrescription: boolean;
  pharmaciesInStock?: number;
  lowestPrice?: number | null;
}

export interface PharmacyStock {
  _id: string;
  name: string;
  phone: string;
  address: string;
  village: string;
  district?: string;
  openingHours?: string;
  isOpen24x7: boolean;
  status: StockStatus;
  price: number | null;
  quantity: number;
}

export interface PatientDashboardData {
  active: Consultation[];
  recentRecords: HealthRecord[];
  latestVitals: HealthRecord | null;
  stats: { availableDoctors: number; pharmacies: number; completed: number };
}

export interface DoctorDashboardData {
  queue: Consultation[];
  isAvailable: boolean;
  stats: { waiting: number; scheduled: number; inProgress: number; urgent: number; completedToday: number; totalCompleted: number };
}

export interface SahayakDashboardData {
  active: Consultation[];
  equipment: Equipment;
  stats: { active: number; assistedToday: number; completedToday: number; equipmentConnected: number };
}
