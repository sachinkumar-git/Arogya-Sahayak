import { Link, useSearchParams } from "react-router-dom";
import { Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { ConsultationCard } from "@/components/consultations/ConsultationCard";
import { DoctorQuickAction } from "@/components/consultations/DoctorQuickAction";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useConsultations } from "@/hooks/api/useConsultations";

type Scope = "active" | "past";

function ConsultationList({ scope }: { scope: Scope }) {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const query = useConsultations(scope);

  return (
    <QueryBoundary query={query}>
      {(consultations) =>
        consultations.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title={t("consultations.empty")}
            description={scope === "active" ? t("consultations.emptyActive") : t("consultations.emptyPast")}
          />
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <ConsultationCard
                key={c._id}
                consultation={c}
                actions={user.role === "doctor" && scope === "active" ? <DoctorQuickAction consultation={c} /> : undefined}
              />
            ))}
          </div>
        )
      }
    </QueryBoundary>
  );
}

export default function ConsultationsPage() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const tab: Scope = params.get("tab") === "past" ? "past" : "active";

  return (
    <>
      <PageHeader
        title={t("consultations.title")}
        subtitle={t("consultations.subtitle")}
        actions={
          user.role !== "doctor" && (
            <Button asChild>
              <Link to="/consultations/new">
                <Plus aria-hidden />
                {user.role === "sahayak" ? t("nav.newAssisted") : t("nav.book")}
              </Link>
            </Button>
          )
        }
      />
      <Tabs value={tab} onValueChange={(value) => setParams(value === "past" ? { tab: "past" } : {}, { replace: true })}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">{t("consultations.active")}</TabsTrigger>
          <TabsTrigger value="past">{t("consultations.past")}</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ConsultationList scope="active" />
        </TabsContent>
        <TabsContent value="past">
          <ConsultationList scope="past" />
        </TabsContent>
      </Tabs>
    </>
  );
}
