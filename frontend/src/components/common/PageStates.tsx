import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandMark } from "@/components/layout/BrandLogo";
import { useLanguage } from "@/context/LanguageContext";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function FullPageLoader() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status">
      <span className="relative flex">
        <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-primary/30" aria-hidden />
        <BrandMark className="h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" />
      </span>
      <span className="text-sm font-medium text-muted-foreground">{t("common.loading")}</span>
    </div>
  );
}

export function FullPageError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <ErrorState title={t("errors.loadFailed")} message={errorMessage(error)} onRetry={onRetry} className="w-full max-w-md" />
    </div>
  );
}

function StateIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: "primary" | "emergency" }) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full ring-8",
        tone === "primary" ? "bg-primary-light text-primary ring-primary-light/50" : "bg-emergency-light text-emergency ring-emergency-light/60",
      )}
    >
      <Icon className="h-7 w-7" aria-hidden />
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ title, message, onRetry, retryLabel, className }: ErrorStateProps) {
  const { t } = useLanguage();
  return (
    <div role="alert" className={cn("health-card flex flex-col items-center gap-3 border-emergency/20 py-10 text-center animate-rise", className)}>
      <StateIcon icon={AlertTriangle} tone="emergency" />
      {title && <h2 className="mt-2 text-lg font-semibold">{title}</h2>}
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-1">
          <RefreshCw aria-hidden />
          {retryLabel ?? t("common.retry")}
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-dots flex flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-10 text-center animate-rise",
        className,
      )}
    >
      <StateIcon icon={icon} tone="primary" />
      <p className="mt-3 font-display text-base font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  const { t } = useLanguage();
  return (
    <div className={cn("space-y-3", className)} role="status" aria-busy="true">
      <span className="sr-only">{t("common.loading")}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="health-card flex items-center gap-4 !p-4" aria-hidden>
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="health-card space-y-3 !p-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
