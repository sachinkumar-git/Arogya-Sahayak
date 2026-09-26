import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientSummaryCard } from "@/components/consultations/PatientSummaryCard";
import { useLanguage } from "@/context/LanguageContext";
import { lookupPatient } from "@/hooks/api/useConsultations";
import { errorMessage } from "@/lib/api";
import type { PatientSummary } from "@/types/api";

interface PatientLookupProps {
  patient: PatientSummary | null;
  onChange: (patient: PatientSummary | null) => void;
}

export function PatientLookup({ patient, onChange }: PatientLookupProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const search = async () => {
    if (query.trim().length < 3 || pending) return;
    setPending(true);
    setMessage("");
    try {
      const found = await lookupPatient(query.trim());
      if (found) onChange(found);
      else setMessage(t("booking.patientNotFound"));
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  if (patient) {
    return (
      <div className="rounded-2xl border border-primary bg-primary-light/40 p-4">
        <PatientSummaryCard patient={patient} />
        <Button type="button" variant="link" size="sm" className="mt-2 px-0" onClick={() => onChange(null)}>
          {t("booking.change")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("booking.lookupPlaceholder")}
          aria-label={t("booking.lookupPlaceholder")}
          inputMode="email"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
        />
        <Button type="button" onClick={search} disabled={pending || query.trim().length < 3}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Search aria-hidden />}
          {t("booking.lookup")}
        </Button>
      </div>
      {message && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
