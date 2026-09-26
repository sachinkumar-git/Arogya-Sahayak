export const queryKeys = {
  dashboard: ["dashboard"] as const,
  consultations: (scope: string) => ["consultations", scope] as const,
  consultation: (id: string) => ["consultation", id] as const,
  doctors: (specialty?: string) => ["doctors", specialty ?? "all"] as const,
  records: ["records"] as const,
  patientRecords: (id: string) => ["patient-records", id] as const,
  medicines: (query: string) => ["medicines", query] as const,
  medicine: (id: string) => ["medicine", id] as const,
};
