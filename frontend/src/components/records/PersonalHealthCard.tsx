import { Link } from "react-router-dom";
import { Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { ageFromDate } from "@/lib/dates";
import { telLink } from "@/lib/format";
import type { User } from "@/types/api";

export function PersonalHealthCard({ user }: { user: User }) {
  const { t } = useLanguage();
  const profile = user.patientProfile ?? {};
  const contact = profile.emergencyContact;
  const age = ageFromDate(profile.dateOfBirth);
  const incomplete = !profile.dateOfBirth || !profile.bloodGroup || !contact?.phone;

  const rows: [string, string][] = [
    [t("records.age"), age !== null ? t("common.yearsOld", { count: age }) : t("common.notSet")],
    [t("records.gender"), profile.gender ? t(`profile.genders.${profile.gender}`) : t("common.notSet")],
    [t("records.bloodGroup"), profile.bloodGroup || t("common.notSet")],
    [t("records.allergies"), profile.allergies || t("consultation.noAllergies")],
    [t("records.conditions"), profile.chronicConditions || t("consultation.noAllergies")],
  ];

  return (
    <section className="health-card space-y-4" aria-labelledby="personal-health">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="personal-health" className="font-semibold">
            {t("records.personal")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.name}
            {user.village && ` · ${user.village}`}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="no-print">
          <Link to="/profile">
            <Pencil aria-hidden />
            {incomplete ? t("records.completeProfile") : t("common.edit")}
          </Link>
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {contact?.name && (
        <div className="rounded-xl bg-emergency-light p-3 text-sm">
          <p className="text-xs font-medium text-emergency">{t("records.emergencyContact")}</p>
          <p className="font-medium">
            {contact.name}
            {contact.relation && ` (${contact.relation})`}
          </p>
          {contact.phone && (
            <a href={telLink(contact.phone)} className="inline-flex items-center gap-1 text-emergency hover:underline">
              <Phone className="h-3 w-3" aria-hidden />
              {contact.phone}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
