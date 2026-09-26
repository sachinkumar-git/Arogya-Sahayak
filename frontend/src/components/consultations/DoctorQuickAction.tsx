import { Loader2, Play, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAcceptConsultation, useStartConsultation } from "@/hooks/api/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import type { Consultation } from "@/types/api";

export function DoctorQuickAction({ consultation }: { consultation: Consultation }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const accept = useAcceptConsultation();
  const start = useStartConsultation();
  const onError = (err: unknown) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" });

  if (!consultation.doctor && consultation.status === "waiting") {
    return (
      <Button
        size="sm"
        disabled={accept.isPending}
        onClick={() => accept.mutate(consultation._id, { onSuccess: () => toast({ description: t("consultation.accepted") }), onError })}
      >
        {accept.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <UserCheck aria-hidden />}
        {t("consultation.accept")}
      </Button>
    );
  }

  if (consultation.viewerRole === "doctor" && (consultation.status === "waiting" || consultation.status === "scheduled")) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={start.isPending}
        onClick={() => start.mutate(consultation._id, { onSuccess: () => toast({ description: t("consultation.started") }), onError })}
      >
        {start.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
        {t("consultation.start")}
      </Button>
    );
  }

  return null;
}
