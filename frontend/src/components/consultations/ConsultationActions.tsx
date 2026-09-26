import { Link } from "react-router-dom";
import { ExternalLink, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import type { Consultation } from "@/types/api";
import { CancelConsultationDialog } from "./CancelConsultationDialog";
import { DoctorQuickAction } from "./DoctorQuickAction";
import { RecordVitalsDialog } from "./RecordVitalsDialog";

export function ConsultationActions({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const role = consultation.viewerRole;
  const isCareProvider = role === "doctor" || role === "sahayak";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {consultation.videoRoomUrl && (
        <Button asChild className="bg-success hover:bg-success/90">
          <a href={consultation.videoRoomUrl} target="_blank" rel="noopener noreferrer" title={t("consultation.joinHint")}>
            <ExternalLink aria-hidden />
            {consultation.mode === "audio" ? t("consultation.joinAudio") : t("consultation.joinVideo")}
          </a>
        </Button>
      )}

      <DoctorQuickAction consultation={consultation} />

      {isCareProvider && consultation.isOpen && <RecordVitalsDialog consultation={consultation} />}

      {isCareProvider && (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/patients/${consultation.patient._id}/records`}>
            <FileText aria-hidden />
            {t("consultation.viewHistory")}
          </Link>
        </Button>
      )}

      {role && consultation.isCancellable && (
        <CancelConsultationDialog
          consultationId={consultation._id}
          label={role === "doctor" ? t("consultation.decline") : t("consultation.cancel")}
        />
      )}

      {consultation.status === "completed" && (
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer aria-hidden />
          {t("consultation.printPrescription")}
        </Button>
      )}
    </div>
  );
}
