import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Inbox, Video } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EmptyState, ListSkeleton, StatSkeleton } from "@/components/common/PageStates";
import { SectionHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { StatCard } from "@/components/common/StatCard";
import { ConsultationCard } from "@/components/consultations/ConsultationCard";
import { DoctorQuickAction } from "@/components/consultations/DoctorQuickAction";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useDashboard, useSetAvailability } from "@/hooks/api/useProfile";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DoctorDashboardData } from "@/types/api";

const QUEUE_POLL_MS = 15_000;

function AvailabilityToggle() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const { toast } = useToast();
  const setAvailability = useSetAvailability();
  const available = user.doctorProfile?.isAvailable ?? false;

  return (
    <div className="flex max-w-sm items-center gap-4 rounded-2xl bg-card p-4 text-card-foreground shadow-md">
      <Switch
        id="availability"
        checked={available}
        disabled={setAvailability.isPending}
        onCheckedChange={(checked) =>
          setAvailability.mutate(checked, {
            onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
          })
        }
      />
      <label htmlFor="availability" className="min-w-0">
        <span className={cn("flex items-center gap-2 font-semibold", available ? "text-success" : "text-muted-foreground")}>
          <span className={cn("h-2 w-2 shrink-0 rounded-full", available ? "bg-success" : "bg-muted-foreground/50")} aria-hidden />
          {available ? t("dashboard.availableNow") : t("dashboard.unavailableNow")}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
          {available ? t("dashboard.availableHint") : t("dashboard.unavailableHint")}
        </span>
      </label>
    </div>
  );
}

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const dashboard = useDashboard<DoctorDashboardData>(QUEUE_POLL_MS);
  const profile = user.doctorProfile;

  return (
    <>
      <DashboardHero
        title={`Dr. ${user.name}`}
        subtitle={
          <>
            {profile?.qualification} · {profile && t(`specialties.${profile.specialization}`)}
          </>
        }
      >
        <AvailabilityToggle />
      </DashboardHero>

      <QueryBoundary
        query={dashboard}
        loading={
          <>
            <StatSkeleton count={5} className="mb-8 sm:grid-cols-3 lg:grid-cols-5" />
            <ListSkeleton />
          </>
        }
      >
        {({ queue, stats }) => (
          <>
            <div className="stagger mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              <StatCard icon={Clock} tone="warning" label={t("dashboard.waiting")} value={stats.waiting} />
              <StatCard icon={CalendarClock} label={t("dashboard.scheduled")} value={stats.scheduled} />
              <StatCard icon={Video} tone="success" label={t("dashboard.inProgress")} value={stats.inProgress} />
              <StatCard icon={AlertTriangle} tone="emergency" label={t("dashboard.urgent")} value={stats.urgent} />
              <StatCard
                icon={CheckCircle2}
                tone="wellness"
                label={t("dashboard.completedToday")}
                value={stats.completedToday}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            <section className="space-y-3" aria-labelledby="queue">
              <SectionHeader
                id="queue"
                title={t("dashboard.queue")}
                count={queue.length}
                action={
                  <span className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-light px-3 py-1 text-xs font-semibold text-success">
                    <span className="relative flex h-2 w-2" aria-hidden>
                      <span className="absolute inset-0 rounded-full bg-success motion-safe:animate-ping" />
                      <span className="relative h-2 w-2 rounded-full bg-success" />
                    </span>
                    {t("dashboard.autoRefresh")}
                  </span>
                }
              />
              {queue.length === 0 ? (
                <EmptyState icon={Inbox} title={t("dashboard.queueEmpty")} description={t("dashboard.queueEmptyHint")} />
              ) : (
                <div className="stagger space-y-3">
                  {queue.map((c) => (
                    <ConsultationCard key={c._id} consultation={c} actions={<DoctorQuickAction consultation={c} />} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </QueryBoundary>
    </>
  );
}
