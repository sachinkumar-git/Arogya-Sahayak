import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { useLanguage } from "@/context/LanguageContext";
import type { Medicine } from "@/types/api";

interface MedicineGridProps {
  medicines: Medicine[];
  selectedId: string | null;
  onSelect: (medicine: Medicine) => void;
}

export function MedicineGrid({ medicines, selectedId, onSelect }: MedicineGridProps) {
  const { t, language } = useLanguage();

  return (
    <div role="radiogroup" aria-label={t("medicines.title")} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {medicines.map((medicine) => {
        const localName = language !== "en" ? medicine.localNames?.[language] : undefined;
        const inStock = (medicine.pharmaciesInStock ?? 0) > 0;
        return (
          <ChoiceCard key={medicine._id} selected={selectedId === medicine._id} onSelect={() => onSelect(medicine)}>
            <span className="flex items-start gap-3 pr-6">
              <span className="icon-large bg-wellness-light text-wellness">
                <Pill className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 space-y-0.5">
                <span className="block font-semibold [overflow-wrap:anywhere]">
                  {medicine.name}
                  {medicine.strength && <span className="ml-1 text-sm font-normal text-muted-foreground">{medicine.strength}</span>}
                </span>
                {localName && <span className="block text-sm">{localName}</span>}
                {medicine.uses && <span className="block text-xs text-muted-foreground">{medicine.uses}</span>}
                <span className="flex flex-wrap gap-1 pt-1">
                  <Badge variant={inStock ? "success" : "muted"}>
                    {inStock ? t("medicines.inStockAt", { count: medicine.pharmaciesInStock ?? 0 }) : t("medicines.notInStock")}
                  </Badge>
                  {inStock && medicine.lowestPrice != null && <Badge variant="outline">{t("medicines.from", { price: medicine.lowestPrice })}</Badge>}
                  {medicine.requiresPrescription && <Badge variant="warning">{t("medicines.prescriptionRequired")}</Badge>}
                </span>
              </span>
            </span>
          </ChoiceCard>
        );
      })}
    </div>
  );
}
