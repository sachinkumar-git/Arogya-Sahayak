type DateInput = string | number | Date | null | undefined;

const toDate = (value: DateInput) => (value ? new Date(value) : null);

export function formatDate(value: DateInput, locale: string) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date) : "";
}

export function formatDateTime(value: DateInput, locale: string) {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date)
    : "";
}

export function formatTime(value: DateInput, locale: string) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date) : "";
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function formatRelative(value: DateInput, locale: string, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "minute") {
      if (unit === "day" && Math.abs(seconds) > 7 * 86400) return formatDate(date, locale);
      return formatter.format(Math.round(seconds / size), unit);
    }
  }
  return formatter.format(0, "minute");
}

export function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const toDateInput = (value: DateInput) => {
  const date = toDate(value);
  return date ? toDateTimeLocal(date).slice(0, 10) : "";
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const mapsLink = (...parts: (string | undefined)[]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.filter(Boolean).join(", "))}`;
