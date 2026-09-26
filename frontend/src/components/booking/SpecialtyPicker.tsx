import { Baby, Bone, Brain, Eye, Flower2, HeartPulse, Sparkles, Stethoscope, type LucideIcon } from "lucide-react";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { toneClasses, type Tone } from "@/lib/tones";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

const STYLE: Record<string, { icon: LucideIcon; tone: Tone }> = {
  general: { icon: Stethoscope, tone: "primary" },
  pediatrics: { icon: Baby, tone: "wellness" },
  cardiology: { icon: HeartPulse, tone: "emergency" },
  orthopedics: { icon: Bone, tone: "accent" },
  psychiatry: { icon: Brain, tone: "success" },
  ophthalmology: { icon: Eye, tone: "warning" },
  gynecology: { icon: Flower2, tone: "emergency" },
  dermatology: { icon: Sparkles, tone: "accent" },
};

export function SpecialtyPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const { t } = useLanguage();
  const { meta } = useSession();

  return (
    <div role="radiogroup" aria-label={t("booking.stepSpecialty")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {meta.specialties.map(({ key }) => {
        const { icon: Icon, tone } = STYLE[key] ?? STYLE.general;
        return (
          <ChoiceCard key={key} selected={value === key} onSelect={() => onChange(key)} className="text-center">
            <span className={cn("icon-large mx-auto mb-2", toneClasses(tone))}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="block text-sm font-medium">{t(`specialties.${key}`)}</span>
          </ChoiceCard>
        );
      })}
    </div>
  );
}
