import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, ChevronRight, FileText, Phone, Pill, Stethoscope, Store, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionTile } from "@/components/common/ActionTile";
import { EmptyState } from "@/components/common/PageStates";
import { SectionHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { ConsultationCard } from "@/components/consultations/ConsultationCard";
import { EmergencyDialog } from "@/components/consultations/EmergencyDialog";
import { VitalsGrid } from "@/components/consultations/VitalsGrid";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useDashboard } from "@/hooks/api/useProfile";
import { useFormatters } from "@/hooks/useFormatters";
import { cn } from "@/lib/utils";
import { toneClasses, type Tone } from "@/lib/tones";
import type { PatientDashboardData } from "@/types/api";

function GlanceRow({ icon: Icon, tone, label, value }: { icon: LucideIcon; tone: Tone; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="flex flex-1 items-center gap-3 text-sm text-muted-foreground">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", toneClasses(tone))}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {label}
      </dt>
      <dd className="font-display text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

export default function PatientDashboard() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const format = useFormatters();
  const dashboard = useDashboard<PatientDashboardData>(30_000);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <>
      <DashboardHero title={t("dashboard.welcome", { name: user.name.split(" ")[0] })} subtitle={t("dashboard.patientSubtitle")}>
        <Button variant="inverse" size="lg" className="btn-large" asChild>
          <Link to="/consultations/new">
            <Stethoscope aria-hidden />
            {t("nav.book")}
          </Link>
        </Button>
      </DashboardHero>

      <button
        type="button"
        onClick={() => setEmergencyOpen(true)}
        className="emergency-btn group mb-6 flex w-full items-center gap-4 rounded-2xl p-4 text-left sm:p-5"
      >
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emergency-foreground/15">
          <span className="absolute inset-0 rounded-full bg-emergency-foreground/25 motion-safe:animate-pulse-ring" aria-hidden />
          <Phone className="h-6 w-6" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold">{t("dashboard.emergencyTitle")}</span>
          <span className="block text-sm opacity-90">{t("dashboard.emergencySubtitle")}</span>
        </span>
        <ChevronRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden />
      </button>

      <div className="stagger mb-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <ActionTile to="/medicines" icon={Pill} tone="wellness" title={t("nav.medicines")} description={t("dashboard.medicinesDesc")} />
        <ActionTile to="/records" icon={FileText} tone="accent" title={t("nav.records")} description={t("dashboard.recordsDesc")} />
        <ActionTile to="/consultations" icon={CalendarClock} title={t("nav.consultations")} description={t("dashboard.consultationsDesc")} />
      </div>

      <QueryBoundary query={dashboard}>
        {(data) => (
          <div className="grid gap-8 lg:grid-cols-3">
            <section className="space-y-3 lg:col-span-2" aria-labelledby="active-consultations">
              <SectionHeader
                id="active-consultations"
                title={t("dashboard.active")}
                count={data.active.length}
                action={
                  <Link to="/consultations" className="rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {t("common.viewAll")}
                  </Link>
                }
              />
              {data.active.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title={t("dashboard.noActive")}
                  description={t("dashboard.noActiveHint")}
                  action={
                    <Button asChild>
                      <Link to="/consultations/new">{t("nav.book")}</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="stagger space-y-3">
                  {data.active.map((c) => (
                    <ConsultationCard key={c._id} consultation={c} />
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <section className="health-card space-y-4" aria-labelledby="latest-vitals">
                <h2 id="latest-vitals" className="section-title text-base">
                  {t("dashboard.latestVitals")}
                </h2>
                <VitalsGrid vitals={data.latestVitals?.vitals} emptyText={t("dashboard.noVitals")} compact />
              </section>

              <div className="health-card">
                <dl className="divide-y divide-border/70">
                  <GlanceRow icon={Stethoscope} tone="primary" label={t("dashboard.doctorsAvailable")} value={data.stats.availableDoctors} />
                  <GlanceRow icon={Store} tone="wellness" label={t("dashboard.pharmacies")} value={data.stats.pharmacies} />
                  <GlanceRow icon={CheckCircle2} tone="success" label={t("dashboard.completed")} value={data.stats.completed} />
                </dl>
              </div>

              <section className="health-card space-y-3" aria-labelledby="recent-records">
                <div className="flex items-center justify-between gap-2">
                  <h2 id="recent-records" className="section-title text-base">
                    {t("dashboard.recentRecords")}
                  </h2>
                  <Link to="/records" className="rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {t("common.viewAll")}
                  </Link>
                </div>
                {data.recentRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("records.empty")}</p>
                ) : (
                  <ul className="-mx-2">
                    {data.recentRecords.map((record) => (
                      <li key={record._id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
                          <FileText className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium" title={record.title}>
                          {record.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{format.date(record.recordedAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          </div>
        )}
      </QueryBoundary>

      <EmergencyDialog open={emergencyOpen} onOpenChange={setEmergencyOpen} />
    </>
  );
}
