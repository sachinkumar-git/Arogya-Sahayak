import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <HeartPulse className="h-5 w-5" />
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-marigold" />
    </span>
  );
}

export function BrandLogo({ to = "/", inverse }: { to?: string; inverse?: boolean }) {
  const { t } = useLanguage();
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <BrandMark />
      <span className={cn("font-display text-lg font-bold tracking-tight sm:text-xl", inverse ? "text-primary-foreground" : "text-foreground")}>
        {t("landing.title")}
      </span>
    </Link>
  );
}
