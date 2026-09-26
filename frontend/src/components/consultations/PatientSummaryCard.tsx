import { Phone, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { telLink } from "@/lib/format";
import type { PatientSummary } from "@/types/api";

export function PatientSummaryCard({ patient }: { patient: PatientSummary }) {
  const { t } = useLanguage();
  const facts = [
    patient.age !== null ? t("common.yearsOld", { count: patient.age }) : null,
    patient.gender ? t(`profile.genders.${patient.gender}`) : null,
    patient.village || null,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="icon-large bg-primary-light text-primary">
          <UserRound className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{patient.name}</p>
          <p className="text-sm text-muted-foreground">{facts.join(" · ")}</p>
          {patient.phone && (
            <a href={telLink(patient.phone)} className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Phone className="h-3 w-3" aria-hidden />
              {patient.phone}
            </a>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">{t("consultation.bloodGroup")}</dt>
          <dd>{patient.bloodGroup ? <Badge variant="outline">{patient.bloodGroup}</Badge> : t("common.notSet")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("consultation.allergies")}</dt>
          <dd className={patient.allergies ? "font-medium text-emergency" : ""}>{patient.allergies || t("consultation.noAllergies")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("consultation.conditions")}</dt>
          <dd>{patient.chronicConditions || t("consultation.noAllergies")}</dd>
        </div>
      </dl>
    </div>
  );
}
