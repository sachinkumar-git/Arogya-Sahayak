import { useState } from "react";
import { Activity, Download, ExternalLink, FileText, FlaskConical, Pill, ScanLine, Stethoscope, Syringe, Trash2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PrescriptionView } from "@/components/consultations/PrescriptionView";
import { VitalsGrid } from "@/components/consultations/VitalsGrid";
import { useLanguage } from "@/context/LanguageContext";
import { recordFileUrl, useDeleteRecord } from "@/hooks/api/useRecords";
import { useFormatters } from "@/hooks/useFormatters";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import type { HealthRecord, RecordType } from "@/types/api";

const ICONS: Record<RecordType, LucideIcon> = {
  consultation: Stethoscope,
  vitals: Activity,
  lab_report: FlaskConical,
  prescription: Pill,
  vaccination: Syringe,
  imaging: ScanLine,
  other: FileText,
};

interface RecordItemProps {
  record: HealthRecord;
  canDelete: boolean;
}

export function RecordItem({ record, canDelete }: RecordItemProps) {
  const { t } = useLanguage();
  const format = useFormatters();
  const { toast } = useToast();
  const remove = useDeleteRecord();
  const [confirming, setConfirming] = useState(false);
  const Icon = ICONS[record.type];

  const confirmDelete = () =>
    remove.mutate(record._id, {
      onSuccess: () => {
        setConfirming(false);
        toast({ description: t("records.deleted") });
      },
      onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
    });

  return (
    <article className="health-card space-y-3 !p-4">
      <div className="flex items-start gap-3">
        <div className="icon-large bg-secondary text-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{record.title}</h3>
            <Badge variant="muted">{t(`records.types.${record.type}`)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {format.date(record.recordedAt)} · {t("records.recordedBy", { name: record.recordedBy?.name ?? "—" })}
          </p>
        </div>
        <div className="no-print flex shrink-0 gap-1">
          {record.hasFile && (
            <>
              <Button variant="ghost" size="icon" asChild>
                <a href={recordFileUrl(record._id, true)} target="_blank" rel="noopener noreferrer" aria-label={t("records.openFile")}>
                  <ExternalLink aria-hidden />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={recordFileUrl(record._id)} aria-label={t("common.download")}>
                  <Download aria-hidden />
                </a>
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => setConfirming(true)} aria-label={t("common.delete")}>
              <Trash2 className="text-destructive" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {record.type === "vitals" && <VitalsGrid vitals={record.vitals} compact />}
      {record.type === "consultation" && record.consultation ? (
        <PrescriptionView
          diagnosis={record.consultation.diagnosis}
          prescription={record.consultation.prescription}
          advice={record.consultation.advice}
          followUpDate={record.consultation.followUpDate}
        />
      ) : (
        record.notes && <p className="whitespace-pre-line text-sm text-muted-foreground">{record.notes}</p>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("records.deleteTitle")}
        description={t("records.deleteDesc")}
        confirmLabel={t("common.delete")}
        onConfirm={confirmDelete}
        pending={remove.isPending}
        destructive
      />
    </article>
  );
}
