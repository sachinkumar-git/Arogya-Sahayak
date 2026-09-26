import type { ReactNode } from "react";
import { FileText, Pill, Stethoscope } from "lucide-react";
import { PulseLine } from "@/components/common/PulseLine";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";
import { SkipLink } from "./SkipLink";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

const HIGHLIGHTS = [
  { icon: Stethoscope, key: "landing.featureConsult" },
  { icon: Pill, key: "landing.featureMedicines" },
  { icon: FileText, key: "landing.featureRecords" },
];

function BrandPanel() {
  const { t } = useLanguage();
  return (
    <aside className="panel-brand sticky top-6 hidden min-h-[32rem] flex-col justify-between p-10 lg:flex">
      <div className="bg-dots-light absolute inset-0 -z-10" aria-hidden />
      <PulseLine className="absolute inset-x-0 bottom-16 -z-10 h-10 w-full text-primary-foreground/20" />
      <p className="eyebrow text-primary-foreground/80">{t("landing.languagesBadge")}</p>
      <div className="space-y-8">
        <p className="font-display text-4xl font-bold leading-tight tracking-tight">{t("landing.subtitle")}</p>
        <ul className="space-y-3">
          {HIGHLIGHTS.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 text-base font-medium">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-primary-foreground/80">{t("landing.footer")}</p>
    </aside>
  );
}

export function AuthLayout({ title, subtitle, children, footer, wide }: AuthLayoutProps) {
  useDocumentTitle(title);
  return (
    <div className="bg-dots min-h-dvh bg-background">
      <SkipLink />
      <header className="container flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
        <BrandLogo />
        <LanguageSelector />
      </header>
      <main id="main" tabIndex={-1} className="container px-4 pb-12 pt-4 sm:px-6 lg:pt-8">
        <div
          className={cn(
            "mx-auto grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
            wide ? "max-w-2xl lg:max-w-6xl" : "max-w-md lg:max-w-5xl",
          )}
        >
          <BrandPanel />
          <div className="animate-rise">
            <div className="health-card shadow-md sm:p-8">
              <div className="mb-6 space-y-1">
                <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>
              {children}
            </div>
            {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
