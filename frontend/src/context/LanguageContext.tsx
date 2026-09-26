import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";
import pa from "@/translations/pa.json";
import type { LanguageCode } from "@/types/api";
import { storage } from "@/lib/storage";

type Dictionary = { [key: string]: string | Dictionary };
type Vars = Record<string, string | number>;

const DICTIONARIES: Record<LanguageCode, Dictionary> = { en, hi, pa };
const STORAGE_KEY = "preferred_language";
const LOCALES: Record<LanguageCode, string> = { en: "en-IN", hi: "hi-IN", pa: "pa-IN" };

function lookup(dictionary: Dictionary, key: string): string | undefined {
  let value: string | Dictionary | undefined = dictionary;
  for (const part of key.split(".")) {
    if (typeof value !== "object") return undefined;
    value = value[part];
  }
  return typeof value === "string" ? value : undefined;
}

const interpolate = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match)) : text;

const isLanguage = (value: unknown): value is LanguageCode => value === "en" || value === "hi" || value === "pa";

interface LanguageContextValue {
  language: LanguageCode;
  locale: string;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, vars?: Vars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = storage.get(STORAGE_KEY);
    return isLanguage(saved) ? saved : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    storage.set(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const text = lookup(DICTIONARIES[language], key) ?? lookup(DICTIONARIES.en, key);
      if (text === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${key}`);
        return key;
      }
      return interpolate(text, vars);
    },
    [language],
  );

  const value = useMemo(() => ({ language, locale: LOCALES[language], setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
