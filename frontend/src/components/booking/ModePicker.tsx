import { ChoiceCard } from "@/components/common/ChoiceCard";
import { ModeIcon } from "@/components/consultations/ModeIcon";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import type { ConsultationMode } from "@/types/api";

export function ModePicker({ value, onChange }: { value: ConsultationMode; onChange: (mode: ConsultationMode) => void }) {
  const { t } = useLanguage();
  const { meta } = useSession();

  return (
    <div role="radiogroup" aria-label={t("booking.stepMode")} className="grid gap-3 sm:grid-cols-3">
      {meta.consultationModes.map((mode) => (
        <ChoiceCard key={mode} selected={value === mode} onSelect={() => onChange(mode)}>
          <span className="flex items-center gap-3">
            <span className="icon-large bg-primary-light text-primary">
              <ModeIcon mode={mode} className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-medium">{t(`mode.${mode}`)}</span>
              <span className="block text-sm text-muted-foreground">{t(`mode.${mode}Desc`)}</span>
            </span>
          </span>
        </ChoiceCard>
      ))}
    </div>
  );
}
