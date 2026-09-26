import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormField } from "@/components/common/FormField";
import { useLanguage } from "@/context/LanguageContext";
import { useCancelConsultation } from "@/hooks/api/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";

export function CancelConsultationDialog({ consultationId, label }: { consultationId: string; label: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const cancel = useCancelConsultation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const confirm = () =>
    cancel.mutate(
      { id: consultationId, reason },
      {
        onSuccess: () => {
          toast({ description: t("consultation.cancelled") });
          setOpen(false);
        },
        onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
      },
    );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-destructive hover:text-destructive">
        <XCircle aria-hidden />
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("consultation.cancelTitle")}
        description={t("consultation.cancelDesc")}
        confirmLabel={label}
        onConfirm={confirm}
        pending={cancel.isPending}
        destructive
      >
        <FormField label={t("consultation.cancelReason")} optional>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} rows={2} />
        </FormField>
      </ConfirmDialog>
    </>
  );
}
