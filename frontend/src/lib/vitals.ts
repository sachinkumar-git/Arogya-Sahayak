import type { Vitals } from "@/types/api";

export type VitalKey = "bp" | "pulse" | "temperature" | "spo2" | "bloodSugar" | "weight";
export type VitalLevel = "low" | "normal" | "high";

interface VitalDefinition {
  key: VitalKey;
  unit: string;
  value: (v: Vitals) => string | null;
  level: (v: Vitals) => VitalLevel | null;
}

const between = (value: number | undefined, low: number, high: number): VitalLevel | null =>
  value === undefined ? null : value < low ? "low" : value > high ? "high" : "normal";

export const VITALS: VitalDefinition[] = [
  {
    key: "bp",
    unit: "mmHg",
    value: (v) => (v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : null),
    level: (v) => {
      if (!v.systolic || !v.diastolic) return null;
      if (v.systolic >= 140 || v.diastolic >= 90) return "high";
      if (v.systolic < 90 || v.diastolic < 60) return "low";
      return "normal";
    },
  },
  { key: "pulse", unit: "bpm", value: (v) => (v.pulse ? String(v.pulse) : null), level: (v) => between(v.pulse, 60, 100) },
  {
    key: "temperature",
    unit: "°F",
    value: (v) => (v.temperature ? v.temperature.toFixed(1) : null),
    level: (v) => between(v.temperature, 95, 99.5),
  },
  { key: "spo2", unit: "%", value: (v) => (v.spo2 ? String(v.spo2) : null), level: (v) => (v.spo2 === undefined ? null : v.spo2 < 95 ? "low" : "normal") },
  {
    key: "bloodSugar",
    unit: "mg/dL",
    value: (v) => (v.bloodSugar ? String(v.bloodSugar) : null),
    level: (v) => between(v.bloodSugar, 70, 180),
  },
  { key: "weight", unit: "kg", value: (v) => (v.weight ? String(v.weight) : null), level: () => null },
];

export const hasVitals = (vitals?: Vitals | null) => Boolean(vitals && VITALS.some((def) => def.value(vitals) !== null));

export const VITAL_FIELDS = [
  { name: "systolic", labelKey: "vitals.systolic", unit: "mmHg", min: 50, max: 260, step: 1 },
  { name: "diastolic", labelKey: "vitals.diastolic", unit: "mmHg", min: 30, max: 160, step: 1 },
  { name: "pulse", labelKey: "vitals.pulse", unit: "bpm", min: 20, max: 250, step: 1 },
  { name: "temperature", labelKey: "vitals.temperature", unit: "°F", min: 90, max: 110, step: 0.1 },
  { name: "spo2", labelKey: "vitals.spo2", unit: "%", min: 50, max: 100, step: 1 },
  { name: "bloodSugar", labelKey: "vitals.bloodSugar", unit: "mg/dL", min: 20, max: 600, step: 1 },
  { name: "weight", labelKey: "vitals.weight", unit: "kg", min: 1, max: 300, step: 0.1 },
] as const;

export type VitalFieldName = (typeof VITAL_FIELDS)[number]["name"];
export type VitalsFormValues = Record<VitalFieldName, string>;

export const emptyVitalsForm = (): VitalsFormValues =>
  Object.fromEntries(VITAL_FIELDS.map((field) => [field.name, ""])) as VitalsFormValues;

export const vitalsFormFrom = (vitals?: Vitals | null): VitalsFormValues =>
  Object.fromEntries(VITAL_FIELDS.map((field) => [field.name, vitals?.[field.name]?.toString() ?? ""])) as VitalsFormValues;

export function vitalsPayload(values: VitalsFormValues): Vitals | undefined {
  const entries = Object.entries(values)
    .filter(([, value]) => value.trim() !== "")
    .map(([name, value]) => [name, Number(value)]);
  return entries.length ? (Object.fromEntries(entries) as Vitals) : undefined;
}
