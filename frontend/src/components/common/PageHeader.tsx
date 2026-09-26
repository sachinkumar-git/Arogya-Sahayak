import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  const { t } = useLanguage();
  useDocumentTitle(title);

  return (
    <header className="mb-6 flex flex-col gap-4 animate-rise sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        {backTo && (
          <Link
            to={backTo}
            className="no-print -ml-2 mb-1 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("common.back")}
          </Link>
        )}
        <h1 className="break-words text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <div className="text-muted-foreground">{subtitle}</div>}
      </div>
      {actions && <div className="no-print flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

interface SectionHeaderProps {
  id: string;
  title: string;
  count?: number;
  action?: ReactNode;
}

export function SectionHeader({ id, title, count, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id={id} className="section-title flex items-center gap-2">
        {title}
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">{count}</span>
        )}
      </h2>
      {action}
    </div>
  );
}
