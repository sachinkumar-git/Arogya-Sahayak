import { Link, useNavigate } from "react-router-dom";
import { Loader2, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useCreateConsultation } from "@/hooks/api/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";

interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyDialog({ open, onOpenChange }: EmergencyDialogProps) {
  const { t } = useLanguage();
  const { user } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const create = useCreateConsultation();

  const connect = () =>
    create.mutate(
      { specialty: "general", mode: "audio", priority: "emergency", complaint: t("emergency.complaint") },
      {
        onSuccess: ({ consultation }) => {
          onOpenChange(false);
          toast({ description: t("emergency.created") });
          navigate(`/consultations/${consultation._id}`);
        },
        onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emergency">{t("emergency.title")}</DialogTitle>
          <DialogDescription>{t("emergency.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <a
            href="tel:108"
            className="emergency-btn flex items-center gap-4 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-7 w-7 shrink-0" aria-hidden />
            <span>
              <span className="block text-lg font-bold">{t("emergency.call108")}</span>
              <span className="block text-sm opacity-90">{t("emergency.call108Desc")}</span>
            </span>
          </a>

          {user?.role === "patient" && (
            <Button variant="outline" className="h-auto w-full justify-start gap-4 p-4 text-left" onClick={connect} disabled={create.isPending}>
              {create.isPending ? <Loader2 className="!h-7 !w-7 animate-spin" aria-hidden /> : <Stethoscope className="!h-7 !w-7 text-primary" aria-hidden />}
              <span className="whitespace-normal">
                <span className="block font-semibold">{t("emergency.connectDoctor")}</span>
                <span className="block text-sm font-normal text-muted-foreground">{t("emergency.connectDoctorDesc")}</span>
              </span>
            </Button>
          )}

          {!user && (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login" onClick={() => onOpenChange(false)}>
                {t("emergency.loginToConnect")}
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
