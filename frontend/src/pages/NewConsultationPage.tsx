import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Loader2, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DoctorPicker } from "@/components/booking/DoctorPicker";
import { ModePicker } from "@/components/booking/ModePicker";
import { PatientLookup } from "@/components/booking/PatientLookup";
import { SpecialtyPicker } from "@/components/booking/SpecialtyPicker";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";
import { VitalsFields } from "@/components/consultations/VitalsFields";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useSession } from "@/context/SessionContext";
import { useCreateConsultation, useDoctors } from "@/hooks/api/useConsultations";
import { useFormatters } from "@/hooks/useFormatters";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, fieldErrors } from "@/lib/api";
import { toDateTimeLocal } from "@/lib/format";
import { emptyVitalsForm, vitalsPayload, type VitalsFormValues } from "@/lib/vitals";
import type { ConsultationMode, PatientSummary, Priority } from "@/types/api";

const MIN_LEAD_MINUTES = 10;

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="health-card space-y-4" aria-labelledby={`step-${number}`}>
      <h2 id={`step-${number}`} className="section-title flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground shadow-primary">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function NewConsultationPage() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const { meta } = useSession();
  const format = useFormatters();
  const { toast } = useToast();
  const navigate = useNavigate();
  const create = useCreateConsultation();
  const isSahayak = user.role === "sahayak";

  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [mode, setMode] = useState<ConsultationMode>("video");
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [vitals, setVitals] = useState<VitalsFormValues>(emptyVitalsForm);
  const [formError, setFormError] = useState("");

  const doctors = useDoctors(specialty || undefined);
  const doctor = doctors.data?.find((d) => d._id === doctorId) ?? null;
  const errors = fieldErrors(create.error);

  const { minTime, maxTime } = useMemo(() => {
    const now = Date.now();
    return {
      minTime: toDateTimeLocal(new Date(now + MIN_LEAD_MINUTES * 60_000)),
      maxTime: toDateTimeLocal(new Date(now + meta.maxDaysInAdvance * 86_400_000)),
    };
  }, [meta.maxDaysInAdvance]);

  const chooseSpecialty = (key: string) => {
    setSpecialty(key);
    setDoctorId(null);
    setTiming("now");
  };

  const chooseDoctor = (id: string | null) => {
    setDoctorId(id);
    if (!id) setTiming("now");
  };

  const doctorOffline = timing === "now" && doctor !== null && !doctor.doctorProfile.isAvailable;
  const isEmergency = priority === "emergency";

  const choosePriority = (value: Priority) => {
    setPriority(value);
    if (value === "emergency") setTiming("now");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (isSahayak && !patient) return setFormError(t("booking.choosePatient"));
    if (!specialty) return setFormError(t("booking.chooseSpecialty"));

    create.mutate(
      {
        patientId: patient?._id,
        doctorId,
        specialty,
        mode,
        priority,
        complaint,
        symptoms,
        scheduledAt: timing === "later" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        vitals: isSahayak ? vitalsPayload(vitals) : undefined,
      },
      {
        onSuccess: ({ consultation }) => {
          toast({ description: t("booking.success") });
          navigate(`/consultations/${consultation._id}`);
        },
        onError: (err) => setFormError(errorMessage(err)),
      },
    );
  };

  let step = 0;
  const next = () => ++step;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isSahayak ? t("booking.sahayakTitle") : t("booking.title")}
        subtitle={isSahayak ? t("booking.sahayakSubtitle") : t("booking.subtitle")}
        backTo="/dashboard"
      />

      <form onSubmit={submit} className="space-y-8" noValidate>
        {isSahayak && (
          <Step number={next()} title={t("booking.stepPatient")}>
            <PatientLookup patient={patient} onChange={setPatient} />
          </Step>
        )}

        <Step number={next()} title={t("booking.stepSpecialty")}>
          <SpecialtyPicker value={specialty} onChange={chooseSpecialty} />
        </Step>

        {specialty && (
          <Step number={next()} title={t("booking.stepDoctor")}>
            <DoctorPicker doctors={doctors.data} loading={doctors.isPending} value={doctorId} onChange={chooseDoctor} />
          </Step>
        )}

        <Step number={next()} title={t("booking.stepMode")}>
          <ModePicker value={mode} onChange={setMode} />
        </Step>

        <Step number={next()} title={t("booking.stepTiming")}>
          <div role="radiogroup" aria-label={t("booking.stepTiming")} className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard selected={timing === "now"} onSelect={() => setTiming("now")}>
              <span className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-wellness" aria-hidden />
                {t("booking.asap")}
              </span>
            </ChoiceCard>
            <ChoiceCard selected={timing === "later"} onSelect={() => setTiming("later")} disabled={!doctorId || isEmergency}>
              <span className="flex items-center gap-2 font-medium">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                {t("booking.schedule")}
              </span>
              {(isEmergency || !doctorId) && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {isEmergency ? t("booking.emergencyNow") : t("booking.scheduleNeedsDoctor")}
                </span>
              )}
            </ChoiceCard>
          </div>
          {timing === "later" && (
            <FormField label={t("booking.appointmentTime")} error={errors.scheduledAt} className="max-w-xs">
              <Input type="datetime-local" value={scheduledAt} min={minTime} max={maxTime} onChange={(e) => setScheduledAt(e.target.value)} required />
            </FormField>
          )}
          {doctorOffline && (
            <Alert>
              <AlertDescription>{t("booking.doctorOffline")}</AlertDescription>
            </Alert>
          )}
        </Step>

        <Step number={next()} title={t("booking.stepDetails")}>
          <div className="space-y-4">
            <FormField label={t("consultation.complaint")} error={errors.complaint}>
              <Input value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder={t("booking.complaintPlaceholder")} maxLength={200} required />
            </FormField>
            <FormField label={t("consultation.symptoms")} optional error={errors.symptoms}>
              <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t("booking.symptomsPlaceholder")} rows={4} maxLength={2000} />
            </FormField>
            <VoiceInputButton onTranscript={(text) => setSymptoms((s) => `${s} ${text}`.trim().slice(0, 2000))} />

            {isSahayak && (
              <>
                <FormField label={t("booking.priority")} className="max-w-xs">
                  <Select value={priority} onValueChange={(value) => choosePriority(value as Priority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meta.priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {t(`priority.${p}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <fieldset className="space-y-3 rounded-2xl border p-4">
                  <legend className="px-1 text-sm font-semibold">{t("booking.vitalsOptional")}</legend>
                  <VitalsFields values={vitals} onChange={(name, value) => setVitals((v) => ({ ...v, [name]: value }))} errors={errors} />
                </fieldset>
              </>
            )}
          </div>
        </Step>

        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 bg-gradient-to-t from-background from-70% to-transparent px-4 pb-2 pt-6 sm:-mx-6 sm:px-6 lg:bottom-0 lg:pb-4">
          <Button
            type="submit"
            className="btn-large w-full shadow-lg"
            disabled={create.isPending || !complaint.trim() || doctorOffline || (timing === "later" && !scheduledAt)}
          >
            {create.isPending && <Loader2 className="animate-spin" aria-hidden />}
            {doctor && !isEmergency
              ? t("booking.submitWithFee", { fee: format.fee(doctor.doctorProfile.consultationFee) })
              : t("booking.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
