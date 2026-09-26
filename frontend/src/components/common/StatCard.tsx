import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneBar, toneClasses, type Tone } from "@/lib/tones";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: Tone;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, tone = "primary", className }: StatCardProps) {
  return (
    <div className={cn("health-card relative overflow-hidden !p-4 sm:!p-5", className)}>
      <span className={cn("absolute inset-x-0 top-0 h-1", toneBar(tone))} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-3xl font-bold tabular-nums leading-none tracking-tight">{value}</p>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses(tone))}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-snug text-muted-foreground">{label}</p>
    </div>
  );
}
