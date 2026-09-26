import type { ReactNode } from "react";
import { PulseLine } from "@/components/common/PulseLine";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormatters } from "@/hooks/useFormatters";

interface DashboardHeroProps {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export function DashboardHero({ title, subtitle, children }: DashboardHeroProps) {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const format = useFormatters();
  useDocumentTitle(title);

  return (
    <header className="panel-brand mb-6 p-6 animate-rise sm:mb-8 sm:p-8">
      <div className="bg-dots-light absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden />
      <PulseLine className="absolute -right-10 top-1/2 -z-10 hidden h-24 w-[28rem] -translate-y-1/2 text-primary-foreground/15 md:block" />
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="eyebrow flex flex-wrap items-center gap-x-2 text-primary-foreground/80">
            <span>{t(`roles.${user.role}`)}</span>
            <span aria-hidden>·</span>
            <span className="normal-case tracking-normal">{format.date(new Date())}</span>
          </p>
          <h1 className="break-words text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <div className="max-w-xl text-primary-foreground/85">{subtitle}</div>}
        </div>
        {children && <div className="no-print flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">{children}</div>}
      </div>
    </header>
  );
}
