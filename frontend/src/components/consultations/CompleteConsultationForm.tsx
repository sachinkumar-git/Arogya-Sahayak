import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/FormField";
import { useLanguage } from "@/context/LanguageContext";
import { useCompleteConsultation } from "@/hooks/api/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, fieldErrors } from "@/lib/api";
import { toDateInput } from "@/lib/format";
import type { PrescriptionItem } from "@/types/api";

const MAX_ITEMS = 15;
const emptyItem = (): PrescriptionItem => ({ medicine: "", dosage: "", frequency: "", duration: "" });

export function CompleteConsultationForm({ consultationId, onDone }: { consultationId: string; onDone: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const complete = useCompleteConsultation();
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [items, setItems] = useState<PrescriptionItem[]>([emptyItem()]);
  const errors = fieldErrors(complete.error);
  const filledRows = items.flatMap((item, index) => (item.medicine.trim() ? [index] : []));
  const rowError = (index: number, field: keyof PrescriptionItem) => {
    const sentIndex = filledRows.indexOf(index);
    return sentIndex === -1 ? undefined : errors[`prescription.${sentIndex}.${field}`];
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    complete.mutate(
      {
        id: consultationId,
        diagnosis,
        advice,
        followUpDate: followUpDate ? new Date(`${followUpDate}T09:00:00`).toISOString() : null,
        prescription: items.filter((item) => item.medicine.trim()),
      },
      {
        onSuccess: () => {
          toast({ description: t("consultation.completed") });
          onDone();
        },
        onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <FormField label={t("consultation.diagnosis")} error={errors.diagnosis}>
        <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} maxLength={1000} required />
      </FormField>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{t("consultation.prescription")}</legend>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-2 rounded-xl border p-3 sm:grid-cols-[2fr_1fr_1.5fr_1fr_auto] sm:items-end">
            <FormField label={t("consultation.medicine")} error={rowError(index, "medicine")} className="col-span-2 sm:col-span-1">
              <Input value={item.medicine} onChange={(e) => updateItem(index, "medicine", e.target.value)} maxLength={80} />
            </FormField>
            <FormField label={t("consultation.dosage")} error={rowError(index, "dosage")}>
              <Input value={item.dosage} onChange={(e) => updateItem(index, "dosage", e.target.value)} placeholder="500mg" maxLength={40} />
            </FormField>
            <FormField label={t("consultation.frequency")} error={rowError(index, "frequency")}>
              <Input value={item.frequency} onChange={(e) => updateItem(index, "frequency", e.target.value)} placeholder="1-0-1" maxLength={60} />
            </FormField>
            <FormField label={t("consultation.duration")} error={rowError(index, "duration")}>
              <Input value={item.duration} onChange={(e) => updateItem(index, "duration", e.target.value)} placeholder="5 days" maxLength={40} />
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("consultation.removeMedicine")}
              onClick={() => setItems((current) => (current.length === 1 ? [emptyItem()] : current.filter((_, i) => i !== index)))}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= MAX_ITEMS}
          onClick={() => setItems((current) => [...current, emptyItem()])}
        >
          <Plus aria-hidden />
          {t("consultation.addMedicine")}
        </Button>
      </fieldset>

      <FormField label={t("consultation.advice")} optional error={errors.advice}>
        <Textarea value={advice} onChange={(e) => setAdvice(e.target.value)} rows={2} maxLength={1000} />
      </FormField>

      <FormField label={t("consultation.followUpDate")} optional error={errors.followUpDate} className="max-w-xs">
        <Input type="date" value={followUpDate} min={toDateInput(new Date(Date.now() + 86400000))} onChange={(e) => setFollowUpDate(e.target.value)} />
      </FormField>

      <Button type="submit" className="w-full sm:w-auto" disabled={complete.isPending}>
        {complete.isPending && <Loader2 className="animate-spin" aria-hidden />}
        {t("consultation.complete")}
      </Button>
    </form>
  );
}
