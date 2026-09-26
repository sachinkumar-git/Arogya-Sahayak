import { useLanguage } from "@/context/LanguageContext";

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only z-[60] rounded-lg bg-primary font-semibold shadow-lg px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      {t("nav.skipToContent")}
    </a>
  );
}
