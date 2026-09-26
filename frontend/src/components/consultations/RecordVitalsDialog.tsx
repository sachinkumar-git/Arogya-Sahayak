import { useState, type FormEvent } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useRecordVitals } from "@/hooks/api/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, fieldErrors } from "@/lib/api";
import { vitalsFormFrom, vitalsPayload, type VitalsFormValues } from "@/lib/vitals";
import type { Consultation } from "@/types/api";
import { VitalsFields } from "./VitalsFields";

export function RecordVitalsDialog({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const recordVitals = useRecordVitals();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<VitalsFormValues>(() => vitalsFormFrom(consultation.vitals));
  const vitals = vitalsPayload(values);

  const openDialog = (next: boolean) => {
    if (next) {
      setValues(vitalsFormFrom(consultation.vitals));
      recordVitals.reset();
    }
    setOpen(next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!vitals) return;
    recordVitals.mutate(
      { id: consultation._id, vitals },
      {
        onSuccess: () => {
          toast({ description: t("consultation.vitalsSaved") });
          setOpen(false);
        },
        onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={openDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Activity aria-hidden />
          {consultation.vitals ? t("consultation.updateVitals") : t("consultation.recordVitals")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>{t("consultation.recordVitals")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <VitalsFields values={values} onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))} errors={fieldErrors(recordVitals.error)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!vitals || recordVitals.isPending}>
              {recordVitals.isPending && <Loader2 className="animate-spin" aria-hidden />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
