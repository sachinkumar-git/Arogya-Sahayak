import { Link } from "react-router-dom";
import { Activity, CheckCircle2, ClipboardPlus, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState, ListSkeleton, StatSkeleton } from "@/components/common/PageStates";
import { SectionHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { StatCard } from "@/components/common/StatCard";
import { ConsultationCard } from "@/components/consultations/ConsultationCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useSession } from "@/context/SessionContext";
import { useDashboard, useSetEquipment } from "@/hooks/api/useProfile";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SahayakDashboardData } from "@/types/api";

function EquipmentPanel() {
  const { t } = useLanguage();
  const { meta } = useSession();
  const user = useCurrentUser();
  const { toast } = useToast();
  const setEquipment = useSetEquipment();
  const equipment = user.sahayakProfile?.equipment ?? {};
  const connectedCount = meta.equipment.filter(({ key }) => equipment[key]).length;
  const total = meta.equipment.length;

  return (
    <section className="health-card space-y-5" aria-labelledby="equipment">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h2 id="equipment" className="section-title text-base">
            {t("dashboard.equipment")}
          </h2>
          <span className="font-display text-sm font-bold tabular-nums text-primary">
            {connectedCount}/{total}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{t("dashboard.equipmentHint")}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-wellness transition-[width] duration-500 ease-out-expo"
            style={{ width: total ? `${(connectedCount / total) * 100}%` : "0%" }}
          />
        </div>
      </div>
      <ul className="space-y-2">
        {meta.equipment.map(({ key }) => {
          const connected = Boolean(equipment[key]);
          return (
            <li
              key={key}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                connected ? "border-success/25 bg-success-light/50" : "border-border bg-card",
              )}
            >
              <label htmlFor={`equipment-${key}`} className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t(`equipment.${key}`)}</span>
                <span
                  className={cn("flex items-center gap-1.5 text-xs font-medium", connected ? "text-success" : "text-muted-foreground")}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-success" : "bg-muted-foreground/50")} aria-hidden />
                  {connected ? t("dashboard.connected") : t("dashboard.disconnected")}
                </span>
              </label>
              <Switch
                id={`equipment-${key}`}
                checked={connected}
                disabled={setEquipment.isPending}
                onCheckedChange={(checked) =>
                  setEquipment.mutate(
                    { [key]: checked },
                    { onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }) },
                  )
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function SahayakDashboard() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const { meta } = useSession();
  const dashboard = useDashboard<SahayakDashboardData>(30_000);

  return (
    <>
      <DashboardHero
        title={t("dashboard.welcome", { name: user.name.split(" ")[0] })}
        subtitle={user.sahayakProfile?.healthCenter || t("dashboard.sahayakSubtitle")}
      >
        <div className="space-y-2">
          <Button variant="inverse" size="lg" className="btn-large w-full" asChild>
            <Link to="/consultations/new">
              <ClipboardPlus aria-hidden />
              {t("nav.newAssisted")}
            </Link>
          </Button>
          <p className="max-w-xs text-sm text-primary-foreground/85">{t("dashboard.newAssistedDesc")}</p>
        </div>
      </DashboardHero>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <QueryBoundary
            query={dashboard}
            loading={
              <>
                <StatSkeleton count={4} className="lg:grid-cols-4" />
                <ListSkeleton />
              </>
            }
          >
            {({ active, stats }) => (
              <>
                <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <StatCard icon={Stethoscope} label={t("dashboard.activeCases")} value={stats.active} />
                  <StatCard icon={Users} tone="wellness" label={t("dashboard.assistedToday")} value={stats.assistedToday} />
                  <StatCard icon={CheckCircle2} tone="success" label={t("dashboard.completedToday")} value={stats.completedToday} />
                  <StatCard icon={Activity} tone="accent" label={t("dashboard.equipmentConnected")} value={`${stats.equipmentConnected}/${meta.equipment.length}`} />
                </div>

                <section className="space-y-3" aria-labelledby="active-cases">
                  <SectionHeader id="active-cases" title={t("dashboard.activeCases")} count={active.length} />
                  {active.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title={t("dashboard.noActiveCases")}
                      description={t("dashboard.noActiveCasesHint")}
                      action={
                        <Button asChild>
                          <Link to="/consultations/new">{t("nav.newAssisted")}</Link>
                        </Button>
                      }
                    />
                  ) : (
                    <div className="stagger space-y-3">
                      {active.map((c) => (
                        <ConsultationCard key={c._id} consultation={c} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </QueryBoundary>
        </div>
        <aside>
          <EquipmentPanel />
        </aside>
      </div>
    </>
  );
}
