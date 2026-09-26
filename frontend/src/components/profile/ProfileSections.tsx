import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { FormField } from "@/components/common/FormField";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import type { FieldErrors } from "@/lib/api";
import { toDateInput } from "@/lib/format";
import type { LanguageCode } from "@/types/api";

export type Values = Record<string, string>;

interface SectionProps {
  values: Values;
  set: (field: string, value: string) => void;
  errors: FieldErrors;
}

const bind = ({ values, set }: SectionProps, field: string) => ({
  value: values[field] ?? "",
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(field, e.target.value),
});

function OptionSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const { t } = useLanguage();
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={t("profile.select")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PatientSection(props: SectionProps) {
  const { t } = useLanguage();
  const { meta } = useSession();
  const { values, set, errors } = props;
  const e = (field: string) => errors[`patientProfile.${field}`];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField label={t("profile.dob")} error={e("dateOfBirth")} optional>
        <Input type="date" max={toDateInput(new Date())} {...bind(props, "dateOfBirth")} />
      </FormField>
      <FormField label={t("profile.gender")} error={e("gender")} optional>
        <OptionSelect
          value={values.gender}
          onChange={(v) => set("gender", v)}
          options={meta.genders.map((g) => ({ value: g, label: t(`profile.genders.${g}`) }))}
        />
      </FormField>
      <FormField label={t("records.bloodGroup")} error={e("bloodGroup")} optional>
        <OptionSelect value={values.bloodGroup} onChange={(v) => set("bloodGroup", v)} options={meta.bloodGroups.map((g) => ({ value: g, label: g }))} />
      </FormField>
      <FormField label={t("records.allergies")} error={e("allergies")} optional className="sm:col-span-3">
        <Textarea rows={2} maxLength={300} {...bind(props, "allergies")} />
      </FormField>
      <FormField label={t("records.conditions")} error={e("chronicConditions")} optional className="sm:col-span-3">
        <Textarea rows={2} maxLength={300} {...bind(props, "chronicConditions")} />
      </FormField>
      <fieldset className="grid gap-4 rounded-2xl border p-4 sm:col-span-3 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold">{t("records.emergencyContact")}</legend>
        <FormField label={t("profile.emergencyName")} error={e("emergencyContact.name")}>
          <Input maxLength={60} {...bind(props, "emergencyName")} />
        </FormField>
        <FormField label={t("profile.emergencyPhone")} error={e("emergencyContact.phone")}>
          <Input type="tel" inputMode="tel" {...bind(props, "emergencyPhone")} />
        </FormField>
        <FormField label={t("profile.relation")} error={e("emergencyContact.relation")}>
          <Input maxLength={30} {...bind(props, "emergencyRelation")} />
        </FormField>
      </fieldset>
    </div>
  );
}

interface DoctorSectionProps extends SectionProps {
  languages: LanguageCode[];
  setLanguages: (languages: LanguageCode[]) => void;
}

export function DoctorSection({ languages, setLanguages, ...props }: DoctorSectionProps) {
  const { t } = useLanguage();
  const { meta } = useSession();
  const { values, set, errors } = props;
  const e = (field: string) => errors[`doctorProfile.${field}`];
  const toggle = (code: LanguageCode) =>
    setLanguages(languages.includes(code) ? (languages.length > 1 ? languages.filter((l) => l !== code) : languages) : [...languages, code]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label={t("auth.specialization")} error={e("specialization")}>
        <OptionSelect
          value={values.specialization}
          onChange={(v) => set("specialization", v)}
          options={meta.specialties.map(({ key }) => ({ value: key, label: t(`specialties.${key}`) }))}
        />
      </FormField>
      <FormField label={t("auth.qualification")} error={e("qualification")}>
        <Input maxLength={100} {...bind(props, "qualification")} />
      </FormField>
      <FormField label={t("auth.licenseNumber")} error={e("licenseNumber")}>
        <Input maxLength={40} {...bind(props, "licenseNumber")} />
      </FormField>
      <FormField label={t("auth.experienceYears")} error={e("experienceYears")}>
        <Input type="number" min={0} max={60} {...bind(props, "experienceYears")} />
      </FormField>
      <FormField label={t("auth.consultationFee")} error={e("consultationFee")}>
        <Input type="number" min={0} max={5000} {...bind(props, "consultationFee")} />
      </FormField>
      <fieldset className="space-y-2 sm:col-span-2">
        <legend className="text-sm font-medium">{t("profile.languagesSpoken")}</legend>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label={t("profile.languagesSpoken")}>
          {meta.languages.map((lang) => (
            <ChoiceCard
              key={lang.code}
              multiple
              selected={languages.includes(lang.code)}
              onSelect={() => toggle(lang.code)}
              className="p-3 text-center"
            >
              {lang.label}
            </ChoiceCard>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function SahayakSection(props: SectionProps) {
  const { t } = useLanguage();
  const e = (field: string) => props.errors[`sahayakProfile.${field}`];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label={t("auth.healthCenter")} error={e("healthCenter")}>
        <Input maxLength={100} {...bind(props, "healthCenter")} />
      </FormField>
      <FormField label={t("auth.certification")} error={e("certification")} optional>
        <Input maxLength={100} {...bind(props, "certification")} />
      </FormField>
    </div>
  );
}
