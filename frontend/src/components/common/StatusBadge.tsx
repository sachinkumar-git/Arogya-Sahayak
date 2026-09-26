import { AlertTriangle } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { ConsultationStatus, Priority } from "@/types/api";

const STATUS_VARIANTS: Record<ConsultationStatus, BadgeProps["variant"]> = {
  scheduled: "info",
  waiting: "warning",
  in_progress: "success",
  completed: "muted",
  cancelled: "outline",
};

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  const { t } = useLanguage();
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status === "in_progress" && "motion-safe:animate-pulse")} aria-hidden />
      {t(`status.${status}`)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLanguage();
  if (priority === "normal") return null;
  return (
    <Badge variant={priority === "emergency" ? "emergency" : "warning"}>
      <AlertTriangle className="h-3 w-3" aria-hidden />
      {t(`priority.${priority}`)}
    </Badge>
  );
}
