import { useEffect, useRef, useState } from "react";
import { Loader2, Phone, Pill, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState, ListSkeleton } from "@/components/common/PageStates";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";
import { MedicineGrid } from "@/components/medicines/MedicineGrid";
import { PharmacyAvailability } from "@/components/medicines/PharmacyAvailability";
import { useLanguage } from "@/context/LanguageContext";
import { useMedicineSearch } from "@/hooks/api/useMedicines";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function MedicinesPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounced = useDebouncedValue(query.trim(), 300);
  const search = useMedicineSearch(debounced);
  const availabilityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && window.matchMedia("(max-width: 1023px)").matches) {
      availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  return (
    <>
      <PageHeader title={t("medicines.title")} subtitle={t("medicines.subtitle")} />

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("medicines.searchPlaceholder")}
            aria-label={t("medicines.searchPlaceholder")}
            className="h-12 pl-10 text-base"
            maxLength={60}
          />
          {search.isFetching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
          )}
        </div>
        <VoiceInputButton onTranscript={setQuery} className="h-12" />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3" aria-labelledby="medicine-results">
          <h2 id="medicine-results" className="font-semibold">
            {debounced ? t("medicines.results") : t("medicines.common")}
          </h2>
          <QueryBoundary query={search} loading={<ListSkeleton rows={4} />}>
            {(medicines) =>
              medicines.length === 0 ? (
                <EmptyState icon={Pill} title={t("medicines.noResults", { query: debounced })} />
              ) : (
                <MedicineGrid medicines={medicines} selectedId={selectedId} onSelect={(m) => setSelectedId(m._id)} />
              )
            }
          </QueryBoundary>
        </section>

        <div ref={availabilityRef} className="scroll-mt-20 space-y-6 lg:col-span-2">
          {selectedId ? (
            <PharmacyAvailability medicineId={selectedId} />
          ) : (
            <EmptyState icon={Search} title={t("medicines.selectHint")} />
          )}

          <a href="tel:108" className="emergency-btn flex items-center gap-3 rounded-2xl p-4">
            <Phone className="h-6 w-6 shrink-0" aria-hidden />
            <span>
              <span className="block font-bold">{t("medicines.emergencyTitle")}</span>
              <span className="block text-sm opacity-90">{t("medicines.emergencyDesc")}</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
