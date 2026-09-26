import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronRight, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useFormatters } from "@/hooks/useFormatters";
import { cn } from "@/lib/utils";
import type { Consultation } from "@/types/api";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ModeIcon } from "./ModeIcon";

const MODE_TONE: Record<Consultation["status"], string> = {
  scheduled: "bg-primary-light text-primary",
  waiting: "bg-warning-light text-warning-strong",
  in_progress: "bg-success-light text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

interface ConsultationCardProps {
  consultation: Consultation;
  actions?: ReactNode;
}

function counterpart(consultation: Consultation, t: (key: string) => string) {
  if (consultation.viewerRole === "patient") {
    return consultation.doctor ? `Dr. ${consultation.doctor.name}` : t("consultation.anyDoctor");
  }
  const { patient } = consultation;
  const age = patient.age !== null ? `, ${patient.age}` : "";
  return `${patient.name}${age}`;
}

export function ConsultationCard({ consultation, actions }: ConsultationCardProps) {
  const { t } = useLanguage();
  const format = useFormatters();
  const { status, priority, scheduledAt, createdAt } = consultation;

  return (
    <article
      className={cn(
        "health-card group relative flex flex-col gap-3 overflow-hidden !p-4 transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-md [&:has(a:focus-visible)]:ring-2 [&:has(a:focus-visible)]:ring-ring [&:has(a:focus-visible)]:ring-offset-2 sm:flex-row sm:items-center sm:gap-4",
        priority === "emergency" && "border-emergency/30 bg-emergency-light/30",
      )}
    >
      {priority !== "normal" && (
        <span className={cn("absolute inset-y-0 left-0 w-1", priority === "emergency" ? "bg-emergency" : "bg-warning")} aria-hidden />
      )}
      <div className={cn("icon-large", MODE_TONE[status])}>
        <ModeIcon mode={consultation.mode} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display font-semibold">
            <Link to={`/consultations/${consultation._id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {counterpart(consultation, t)}
            </Link>
          </h3>
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
        <p className="truncate text-sm text-foreground/80" title={consultation.complaint}>
          {consultation.complaint}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs font-medium text-muted-foreground">
          <span className="rounded-md bg-muted px-1.5 py-0.5">{t(`specialties.${consultation.specialty}`)}</span>
          {consultation.viewerRole !== "sahayak" && consultation.sahayak && <span>{t("consultation.sahayak")}: {consultation.sahayak.name}</span>}
          {consultation.viewerRole === "sahayak" && consultation.doctor && <span>Dr. {consultation.doctor.name}</span>}
          <span className="inline-flex items-center gap-1">
            {scheduledAt && status === "scheduled" ? (
              <>
                <CalendarClock className="h-3 w-3" aria-hidden />
                {format.dateTime(scheduledAt)}
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" aria-hidden />
                {format.relative(createdAt)}
              </>
            )}
          </span>
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-2 self-end sm:self-center">
        {actions}
        <ChevronRight
          className="hidden h-5 w-5 text-muted-foreground transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transform-none sm:block"
          aria-hidden
        />
      </div>
    </article>
  );
}
