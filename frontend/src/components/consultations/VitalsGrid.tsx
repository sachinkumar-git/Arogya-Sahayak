import { Activity, Droplet, Heart, Scale, Thermometer, Wind, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFormatters } from "@/hooks/useFormatters";
import { cn } from "@/lib/utils";
import { VITALS, hasVitals, type VitalKey, type VitalLevel } from "@/lib/vitals";
import type { Vitals } from "@/types/api";

const ICONS: Record<VitalKey, LucideIcon> = {
  bp: Heart,
  pulse: Activity,
  temperature: Thermometer,
  spo2: Wind,
  bloodSugar: Droplet,
  weight: Scale,
};

const LEVEL_STYLES: Record<VitalLevel, string> = {
  normal: "text-success",
  high: "text-emergency",
  low: "text-warning-strong",
};

interface VitalsGridProps {
  vitals?: Vitals | null;
  emptyText?: string;
  compact?: boolean;
}

export function VitalsGrid({ vitals, emptyText, compact }: VitalsGridProps) {
  const { t } = useLanguage();
  const format = useFormatters();

  if (!vitals || !hasVitals(vitals)) {
    return <p className="text-sm text-muted-foreground">{emptyText ?? t("consultation.noVitals")}</p>;
  }

  const readings = VITALS.map((def) => ({ def, value: def.value(vitals), level: def.level(vitals) })).filter((r) => r.value);

  return (
    <div className="space-y-2">
      <dl className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-2" : "grid-cols-2 lg:grid-cols-3")}>
        {readings.map(({ def, value, level }) => {
          const Icon = ICONS[def.key];
          return (
            <div key={def.key} className="rounded-xl border border-border/70 bg-secondary/70 p-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {t(`vitals.${def.key}`)}
              </dt>
              <dd className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-xl font-bold tabular-nums">{value}</span>
                <span className="text-xs text-muted-foreground">{def.unit}</span>
              </dd>
              {level && (
                <dd className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold", LEVEL_STYLES[level])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {t(`vitals.${level}`)}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
      {vitals.recordedAt && (
        <p className="text-xs text-muted-foreground">{t("vitals.recordedOn", { time: format.relative(vitals.recordedAt) })}</p>
      )}
    </div>
  );
}
