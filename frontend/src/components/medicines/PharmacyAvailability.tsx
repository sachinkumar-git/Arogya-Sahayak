import { Clock, MapPin, Navigation, Phone, Store } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ListSkeleton } from "@/components/common/PageStates";
import { QueryBoundary } from "@/components/common/QueryBoundary";
import { useLanguage } from "@/context/LanguageContext";
import { useMedicineAvailability } from "@/hooks/api/useMedicines";
import { useFormatters } from "@/hooks/useFormatters";
import { mapsLink, telLink } from "@/lib/format";
import type { StockStatus } from "@/types/api";

const STATUS: Record<StockStatus, { key: string; variant: BadgeProps["variant"] }> = {
  in_stock: { key: "medicines.inStock", variant: "success" },
  low_stock: { key: "medicines.lowStock", variant: "warning" },
  out_of_stock: { key: "medicines.outOfStock", variant: "outline" },
};

export function PharmacyAvailability({ medicineId }: { medicineId: string }) {
  const { t } = useLanguage();
  const format = useFormatters();
  const query = useMedicineAvailability(medicineId);

  return (
    <QueryBoundary query={query} loading={<ListSkeleton rows={3} />}>
      {({ medicine, pharmacies }) => (
        <section className="space-y-3" aria-labelledby="availability" aria-live="polite">
          <h2 id="availability" className="text-lg font-semibold">
            {t("medicines.availability", { name: medicine.name })}
          </h2>
          {pharmacies.length === 0 ? (
            <EmptyState icon={Store} title={t("medicines.noPharmacies")} />
          ) : (
            pharmacies.map((pharmacy) => {
              const status = STATUS[pharmacy.status];
              const available = pharmacy.status !== "out_of_stock";
              return (
                <article key={pharmacy._id} className="health-card space-y-3 !p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{pharmacy.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" aria-hidden />
                        {pharmacy.address}, {pharmacy.village}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" aria-hidden />
                        {pharmacy.isOpen24x7 ? t("medicines.open24") : pharmacy.openingHours}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={status.variant}>{t(status.key)}</Badge>
                      {available && pharmacy.price !== null && (
                        <p className="mt-1 text-lg font-semibold text-success">{format.currency(pharmacy.price)}</p>
                      )}
                      {pharmacy.status === "low_stock" && (
                        <p className="text-xs text-muted-foreground">{t("medicines.units", { count: pharmacy.quantity })}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={telLink(pharmacy.phone)}>
                        <Phone aria-hidden />
                        {t("common.call")}
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={mapsLink(pharmacy.name, pharmacy.address, pharmacy.village, pharmacy.district)} target="_blank" rel="noopener noreferrer">
                        <Navigation aria-hidden />
                        {t("common.directions")}
                      </a>
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}
    </QueryBoundary>
  );
}
