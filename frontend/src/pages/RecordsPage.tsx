import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { VitalsGrid } from "@/components/consultations/VitalsGrid";
import { PersonalHealthCard } from "@/components/records/PersonalHealthCard";
import { RecordList } from "@/components/records/RecordList";
import { UploadRecordDialog } from "@/components/records/UploadRecordDialog";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useMyRecords } from "@/hooks/api/useRecords";

export default function RecordsPage() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const records = useMyRecords();

  return (
    <>
      <PageHeader
        title={t("records.title")}
        subtitle={t("records.subtitle")}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden />
              {t("common.print")}
            </Button>
            <UploadRecordDialog />
          </>
        }
      />

      <div className="space-y-6">
        <PersonalHealthCard user={user} />
        <QueryBoundary query={records}>
          {({ records, latestVitals }) => (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="health-card h-fit min-w-0 space-y-3 lg:order-2" aria-labelledby="vitals">
                <h2 id="vitals" className="font-semibold">
                  {t("dashboard.latestVitals")}
                </h2>
                <VitalsGrid vitals={latestVitals?.vitals} emptyText={t("dashboard.noVitals")} compact />
              </section>
              <div className="min-w-0 lg:order-1 lg:col-span-2">
                <RecordList records={records} deletableBy={user._id} />
              </div>
            </div>
          )}
        </QueryBoundary>
      </div>
    </>
  );
}
