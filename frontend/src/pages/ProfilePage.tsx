import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { DoctorSection, PatientSection, SahayakSection, type Values } from "@/components/profile/ProfileSections";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser } from "@/context/SessionContext";
import { useUpdateProfile } from "@/hooks/api/useProfile";
import { useToast } from "@/hooks/use-toast";
import { errorMessage, fieldErrors } from "@/lib/api";
import { toDateInput } from "@/lib/format";
import type { LanguageCode, User } from "@/types/api";

function initialValues(user: User): Values {
  const p = user.patientProfile ?? {};
  const d = user.doctorProfile;
  const s = user.sahayakProfile;
  return {
    name: user.name,
    phone: user.phone,
    village: user.village,
    dateOfBirth: toDateInput(p.dateOfBirth),
    gender: p.gender ?? "",
    bloodGroup: p.bloodGroup ?? "",
    allergies: p.allergies ?? "",
    chronicConditions: p.chronicConditions ?? "",
    emergencyName: p.emergencyContact?.name ?? "",
    emergencyPhone: p.emergencyContact?.phone ?? "",
    emergencyRelation: p.emergencyContact?.relation ?? "",
    specialization: d?.specialization ?? "general",
    qualification: d?.qualification ?? "",
    licenseNumber: d?.licenseNumber ?? "",
    experienceYears: String(d?.experienceYears ?? ""),
    consultationFee: String(d?.consultationFee ?? ""),
    healthCenter: s?.healthCenter ?? "",
    certification: s?.certification ?? "",
  };
}

function buildPayload(role: User["role"], v: Values, languages: LanguageCode[]) {
  const base = { name: v.name, phone: v.phone, village: v.village };
  if (role === "patient") {
    return {
      ...base,
      patientProfile: {
        dateOfBirth: v.dateOfBirth || null,
        gender: v.gender || null,
        bloodGroup: v.bloodGroup || null,
        allergies: v.allergies,
        chronicConditions: v.chronicConditions,
        emergencyContact: { name: v.emergencyName, phone: v.emergencyPhone, relation: v.emergencyRelation },
      },
    };
  }
  if (role === "doctor") {
    return {
      ...base,
      doctorProfile: {
        specialization: v.specialization,
        qualification: v.qualification,
        licenseNumber: v.licenseNumber,
        experienceYears: Number(v.experienceYears || 0),
        consultationFee: Number(v.consultationFee || 0),
        languages,
      },
    };
  }
  return { ...base, sahayakProfile: { healthCenter: v.healthCenter, certification: v.certification } };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="health-card space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const user = useCurrentUser();
  const { toast } = useToast();
  const update = useUpdateProfile();
  const [values, setValues] = useState<Values>(() => initialValues(user));
  const [languages, setLanguages] = useState<LanguageCode[]>(user.doctorProfile?.languages ?? ["en"]);
  const errors = fieldErrors(update.error);
  const set = (field: string, value: string) => setValues((v) => ({ ...v, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(buildPayload(user.role, values, languages), {
      onSuccess: () => toast({ description: t("profile.saved") }),
      onError: (err) => toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" }),
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")} />
      <form onSubmit={submit} className="space-y-6" noValidate>
        <Section title={t("profile.basic")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("auth.fullName")} error={errors.name} className="sm:col-span-2">
              <Input value={values.name} onChange={(e) => set("name", e.target.value)} maxLength={60} required />
            </FormField>
            <FormField label={t("auth.email")}>
              <Input value={user.email} disabled readOnly />
            </FormField>
            <FormField label={t("auth.phone")} error={errors.phone} optional>
              <Input type="tel" inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label={t("auth.village")} error={errors.village} optional className="sm:col-span-2">
              <Input value={values.village} onChange={(e) => set("village", e.target.value)} maxLength={60} />
            </FormField>
          </div>
        </Section>

        {user.role === "patient" && (
          <Section title={t("profile.medical")}>
            <PatientSection values={values} set={set} errors={errors} />
          </Section>
        )}
        {user.role === "doctor" && (
          <Section title={t("profile.professional")}>
            <DoctorSection values={values} set={set} errors={errors} languages={languages} setLanguages={setLanguages} />
          </Section>
        )}
        {user.role === "sahayak" && (
          <Section title={t("profile.professional")}>
            <SahayakSection values={values} set={set} errors={errors} />
          </Section>
        )}

        <Button type="submit" className="btn-large w-full sm:w-auto" disabled={update.isPending}>
          {update.isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t("common.saveChanges")}
        </Button>
      </form>
    </div>
  );
}
