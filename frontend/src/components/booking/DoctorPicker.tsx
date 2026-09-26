import { Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { EmptyState, ListSkeleton } from "@/components/common/PageStates";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useFormatters } from "@/hooks/useFormatters";
import { initials } from "@/lib/format";
import type { DoctorSummary } from "@/types/api";

interface DoctorPickerProps {
  doctors: DoctorSummary[] | undefined;
  loading: boolean;
  value: string | null;
  onChange: (doctorId: string | null) => void;
}

export function DoctorPicker({ doctors, loading, value, onChange }: DoctorPickerProps) {
  const { t } = useLanguage();
  const { meta } = useSession();
  const format = useFormatters();
  const languageLabel = (code: string) => meta.languages.find((l) => l.code === code)?.label ?? code;

  if (loading) return <ListSkeleton rows={2} />;

  return (
    <div role="radiogroup" aria-label={t("booking.stepDoctor")} className="space-y-3">
      <ChoiceCard selected={value === null} onSelect={() => onChange(null)}>
        <span className="flex items-center gap-3">
          <span className="icon-large bg-wellness-light text-wellness">
            <Zap className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-medium">{t("consultation.anyDoctor")}</span>
            <span className="block text-sm text-muted-foreground">{t("booking.anyDoctorDesc")}</span>
          </span>
        </span>
      </ChoiceCard>

      {doctors?.length === 0 && <EmptyState icon={Users} title={t("booking.noDoctors")} />}

      {doctors?.map((doctor) => {
        const profile = doctor.doctorProfile;
        return (
          <ChoiceCard key={doctor._id} selected={value === doctor._id} onSelect={() => onChange(doctor._id)}>
            <span className="flex items-start gap-3 pr-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">
                {initials(doctor.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Dr. {doctor.name}</span>
                  {profile.isAvailable ? (
                    <Badge variant="success">{t("dashboard.availableNow")}</Badge>
                  ) : (
                    <Badge variant="muted">{t("booking.offline")}</Badge>
                  )}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {profile.qualification} · {t("common.years", { count: profile.experienceYears })}
                </span>
                <span className="block text-xs text-muted-foreground">{profile.languages.map(languageLabel).join(", ")}</span>
              </span>
              <span className="shrink-0 font-semibold text-primary">{format.fee(profile.consultationFee)}</span>
            </span>
          </ChoiceCard>
        );
      })}
    </div>
  );
}
