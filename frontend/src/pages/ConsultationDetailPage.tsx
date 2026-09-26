import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { PriorityBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ChatPanel } from "@/components/consultations/ChatPanel";
import { CompleteConsultationForm } from "@/components/consultations/CompleteConsultationForm";
import { ConsultationActions } from "@/components/consultations/ConsultationActions";
import { ModeIcon } from "@/components/consultations/ModeIcon";
import { PatientSummaryCard } from "@/components/consultations/PatientSummaryCard";
import { PrescriptionView } from "@/components/consultations/PrescriptionView";
import { VitalsGrid } from "@/components/consultations/VitalsGrid";
import { useLanguage } from "@/context/LanguageContext";
import { useConsultation } from "@/hooks/api/useConsultations";
import { useFormatters } from "@/hooks/useFormatters";
import { cn } from "@/lib/utils";
import type { Consultation } from "@/types/api";

function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("health-card space-y-4", className)}>
      <h2 className="section-title text-base">{title}</h2>
      {children}
    </section>
  );
}

function CareTeam({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const format = useFormatters();
  const { doctor, sahayak } = consultation;
  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">{t("consultation.doctor")}</dt>
        <dd className="font-medium">
          {doctor ? `Dr. ${doctor.name}` : <span className="text-warning-strong">{t("consultation.awaitingDoctor")}</span>}
        </dd>
        {doctor && <dd className="text-xs text-muted-foreground">{doctor.doctorProfile.qualification}</dd>}
      </div>
      {sahayak && (
        <div>
          <dt className="text-xs text-muted-foreground">{t("consultation.sahayak")}</dt>
          <dd className="font-medium">{sahayak.name}</dd>
          {sahayak.healthCenter && <dd className="text-xs text-muted-foreground">{sahayak.healthCenter}</dd>}
        </div>
      )}
      <div>
        <dt className="text-xs text-muted-foreground">{t("consultation.fee")}</dt>
        <dd className="font-medium">{format.fee(consultation.fee)}</dd>
      </div>
    </dl>
  );
}

function ConsultationView({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const format = useFormatters();
  const isDoctor = consultation.viewerRole === "doctor";
  const inPool = !consultation.doctor && consultation.status === "waiting";

  const when =
    consultation.status === "scheduled" && consultation.scheduledAt
      ? t("consultation.scheduledFor", { time: format.dateTime(consultation.scheduledAt) })
      : t("consultation.requestedAt", { time: format.dateTime(consultation.createdAt) });

  return (
    <>
      <PageHeader
        title={consultation.complaint}
        backTo={consultation.isOpen ? "/consultations" : "/consultations?tab=past"}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={consultation.status} />
            <PriorityBadge priority={consultation.priority} />
            <span className="inline-flex items-center gap-1 text-sm">
              <ModeIcon mode={consultation.mode} className="h-4 w-4" />
              {t(`mode.${consultation.mode}`)}
            </span>
            <span className="text-sm">· {t(`specialties.${consultation.specialty}`)}</span>
            <span className="text-sm">· {when}</span>
          </span>
        }
      />

      <div className="no-print mb-6 space-y-3">
        {consultation.priority === "emergency" && consultation.isOpen && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            <AlertDescription>{t("consultation.emergencyNotice")}</AlertDescription>
          </Alert>
        )}
        {inPool && consultation.viewerRole !== "patient" && consultation.viewerRole !== "sahayak" && (
          <Alert>
            <Info className="h-4 w-4" aria-hidden />
            <AlertDescription>{t("consultation.poolNotice")}</AlertDescription>
          </Alert>
        )}
        <ConsultationActions consultation={consultation} />
        {consultation.status === "cancelled" && consultation.cancelledBy && (
          <p className="text-sm text-muted-foreground">
            {t("consultation.cancelledBy", { role: t(`roles.${consultation.cancelledBy}`) })}
            {consultation.cancelReason && `: ${consultation.cancelReason}`}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {consultation.viewerRole !== "patient" && (
            <Panel title={t("consultation.patient")}>
              <PatientSummaryCard patient={consultation.patient} />
            </Panel>
          )}

          <Panel title={t("consultation.symptoms")}>
            <p className="whitespace-pre-line text-sm">{consultation.symptoms || consultation.complaint}</p>
          </Panel>

          <Panel title={t("consultation.vitals")}>
            <VitalsGrid vitals={consultation.vitals} />
          </Panel>

          {consultation.status === "completed" && (
            <Panel title={t("consultation.completeTitle")}>
              <PrescriptionView
                diagnosis={consultation.diagnosis}
                prescription={consultation.prescription}
                advice={consultation.advice}
                followUpDate={consultation.followUpDate}
              />
            </Panel>
          )}

          {isDoctor && consultation.status === "in_progress" && (
            <Panel title={t("consultation.completeTitle")} className="no-print border-primary/40">
              <CompleteConsultationForm consultationId={consultation._id} onDone={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            </Panel>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title={t("consultation.title")}>
            <CareTeam consultation={consultation} />
          </Panel>
          {consultation.viewerRole && (
            <Panel title={t("consultation.messages")} className="no-print">
              <ChatPanel consultation={consultation} />
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

export default function ConsultationDetailPage() {
  const { id = "" } = useParams();
  const query = useConsultation(id);
  return <QueryBoundary query={query}>{(consultation) => <ConsultationView consultation={consultation} />}</QueryBoundary>;
}
