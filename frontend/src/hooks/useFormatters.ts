import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency, formatDate, formatDateTime, formatRelative, formatTime } from "@/lib/format";

type DateInput = Parameters<typeof formatDate>[0];

const probed = new Map<string, string>();
function formattingLocale(locale: string) {
  if (!probed.has(locale)) {
    const sample = new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2026, 8, 12));
    probed.set(locale, /^M\d+$/.test(sample.trim()) ? "en-IN" : locale);
  }
  return probed.get(locale)!;
}

export function useFormatters() {
  const { locale: languageLocale, t } = useLanguage();
  const locale = formattingLocale(languageLocale);
  return useMemo(
    () => ({
      date: (value: DateInput) => formatDate(value, locale),
      dateTime: (value: DateInput) => formatDateTime(value, locale),
      time: (value: DateInput) => formatTime(value, locale),
      relative: (value: DateInput) => formatRelative(value, locale),
      fee: (amount: number) => (amount > 0 ? formatCurrency(amount, locale) : t("common.free")),
      currency: (amount: number) => formatCurrency(amount, locale),
    }),
    [locale, t],
  );
}
