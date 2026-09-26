import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { useLanguage } from "@/context/LanguageContext";
import { VITAL_FIELDS, type VitalFieldName, type VitalsFormValues } from "@/lib/vitals";
import type { FieldErrors } from "@/lib/api";

interface VitalsFieldsProps {
  values: VitalsFormValues;
  onChange: (name: VitalFieldName, value: string) => void;
  errors?: FieldErrors;
  errorPrefix?: string;
}

export function VitalsFields({ values, onChange, errors = {}, errorPrefix = "vitals" }: VitalsFieldsProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {VITAL_FIELDS.map((field) => (
        <FormField
          key={field.name}
          label={`${t(field.labelKey)} (${field.unit})`}
          error={errors[`${errorPrefix}.${field.name}`]}
        >
          <Input
            type="number"
            inputMode="decimal"
            min={field.min}
            max={field.max}
            step={field.step}
            value={values[field.name]}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        </FormField>
      ))}
    </div>
  );
}
