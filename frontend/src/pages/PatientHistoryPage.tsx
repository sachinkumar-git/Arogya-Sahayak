import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { PatientSummaryCard } from "@/components/consultations/PatientSummaryCard";
import { VitalsGrid } from "@/components/consultations/VitalsGrid";
import { RecordList } from "@/components/records/RecordList";
import { useLanguage } from "@/context/LanguageContext";
import { usePatientRecords } from "@/hooks/api/useRecords";

export default function PatientHistoryPage() {
  const { t } = useLanguage();
  const { id = "" } = useParams();
  const query = usePatientRecords(id);

  return (
    <QueryBoundary query={query}>
      {({ patient, records, latestVitals }) => (
        <>
          <PageHeader title={t("records.historyTitle")} subtitle={patient.name} backTo="/consultations" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="min-w-0 space-y-6 lg:order-2">
              <section className="health-card">
                <PatientSummaryCard patient={patient} />
              </section>
              <section className="health-card space-y-3">
                <h2 className="font-semibold">{t("dashboard.latestVitals")}</h2>
                <VitalsGrid vitals={latestVitals?.vitals} compact />
              </section>
            </div>
            <div className="min-w-0 lg:order-1 lg:col-span-2">
              <RecordList records={records} />
            </div>
          </div>
        </>
      )}
    </QueryBoundary>
  );
}
