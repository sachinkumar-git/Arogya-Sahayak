import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { HeartHandshake, Loader2, Stethoscope, UserRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChoiceCard } from "@/components/common/ChoiceCard";
import { FormField } from "@/components/common/FormField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, type SignupInput } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { ApiError, errorMessage, type FieldErrors } from "@/lib/api";
import type { Role } from "@/types/api";

const ROLE_ICONS = { patient: UserRound, sahayak: HeartHandshake, doctor: Stethoscope } as const;
const isRole = (value: string | null): value is Role => value === "patient" || value === "sahayak" || value === "doctor";

const INITIAL = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  village: "",
  specialization: "general",
  qualification: "",
  licenseNumber: "",
  experienceYears: "",
  consultationFee: "",
  healthCenter: "",
  certification: "",
};

type Form = typeof INITIAL;

export default function SignupPage() {
  const { t, language } = useLanguage();
  const { signup, meta } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(() => (isRole(params.get("role")) ? (params.get("role") as Role) : "patient"));
  const [form, setForm] = useState<Form>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const set = (field: keyof Form) => (value: string) => setForm((f) => ({ ...f, [field]: value }));
  const bind = (field: keyof Form) => ({ value: form[field], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(field)(e.target.value) });

  const payload = (): SignupInput => ({
    name: form.name,
    email: form.email,
    password: form.password,
    role,
    phone: form.phone,
    village: form.village,
    preferredLanguage: language,
    doctor:
      role === "doctor"
        ? {
            specialization: form.specialization,
            qualification: form.qualification,
            licenseNumber: form.licenseNumber,
            experienceYears: Number(form.experienceYears || 0),
            consultationFee: Number(form.consultationFee || 0),
          }
        : undefined,
    sahayak: role === "sahayak" ? { healthCenter: form.healthCenter, certification: form.certification } : undefined,
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const clientErrors: FieldErrors = {};
    if (form.password.length < 8) clientErrors.password = t("auth.passwordHint");
    if (form.password !== form.confirmPassword) clientErrors.confirmPassword = t("auth.passwordsDontMatch");
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setPending(true);
    try {
      const user = await signup(payload());
      toast({ description: t("auth.welcome", { name: user.name }) });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors(err instanceof ApiError ? err.errors : {});
      setFormError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      wide
      title={t("auth.signupTitle")}
      subtitle={t("auth.signupSubtitle")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t("nav.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">{t("auth.iAmA")}</legend>
          <div role="radiogroup" aria-label={t("auth.iAmA")} className="grid grid-cols-3 gap-2">
            {meta.roles.map((r) => {
              const Icon = ROLE_ICONS[r];
              return (
                <ChoiceCard key={r} selected={role === r} onSelect={() => setRole(r)} className="p-3 text-center">
                  <Icon className="mx-auto mb-1 h-6 w-6 text-primary" aria-hidden />
                  <span className="block text-sm font-medium">{t(`roles.${r}`)}</span>
                </ChoiceCard>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{t(`roles.${role}Desc`)}</p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("auth.fullName")} error={errors.name} className="sm:col-span-2">
            <Input autoComplete="name" required {...bind("name")} />
          </FormField>
          <FormField label={t("auth.email")} error={errors.email}>
            <Input type="email" autoComplete="email" required {...bind("email")} />
          </FormField>
          <FormField label={t("auth.phone")} error={errors.phone} optional>
            <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" {...bind("phone")} />
          </FormField>
          <FormField label={t("auth.password")} error={errors.password} hint={t("auth.passwordHint")}>
            <PasswordInput autoComplete="new-password" required {...bind("password")} />
          </FormField>
          <FormField label={t("auth.confirmPassword")} error={errors.confirmPassword}>
            <PasswordInput autoComplete="new-password" required {...bind("confirmPassword")} />
          </FormField>
          <FormField label={t("auth.village")} error={errors.village} optional className="sm:col-span-2">
            <Input autoComplete="address-level2" {...bind("village")} />
          </FormField>
        </div>

        {role === "doctor" && (
          <fieldset className="space-y-4 rounded-2xl border p-4">
            <legend className="px-1 text-sm font-semibold">{t("auth.professionalDetails")}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("auth.specialization")} error={errors["doctor.specialization"]}>
                <Select value={form.specialization} onValueChange={set("specialization")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.specialties.map(({ key }) => (
                      <SelectItem key={key} value={key}>
                        {t(`specialties.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label={t("auth.qualification")} error={errors["doctor.qualification"]}>
                <Input placeholder={t("auth.qualificationPlaceholder")} {...bind("qualification")} />
              </FormField>
              <FormField label={t("auth.licenseNumber")} error={errors["doctor.licenseNumber"]}>
                <Input {...bind("licenseNumber")} />
              </FormField>
              <FormField label={t("auth.experienceYears")} error={errors["doctor.experienceYears"]}>
                <Input type="number" min={0} max={60} inputMode="numeric" {...bind("experienceYears")} />
              </FormField>
              <FormField label={t("auth.consultationFee")} error={errors["doctor.consultationFee"]}>
                <Input type="number" min={0} max={5000} inputMode="numeric" {...bind("consultationFee")} />
              </FormField>
            </div>
          </fieldset>
        )}

        {role === "sahayak" && (
          <fieldset className="space-y-4 rounded-2xl border p-4">
            <legend className="px-1 text-sm font-semibold">{t("auth.professionalDetails")}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("auth.healthCenter")} error={errors["sahayak.healthCenter"]}>
                <Input placeholder={t("auth.healthCenterPlaceholder")} {...bind("healthCenter")} />
              </FormField>
              <FormField label={t("auth.certification")} error={errors["sahayak.certification"]} optional>
                <Input {...bind("certification")} />
              </FormField>
            </div>
          </fieldset>
        )}

        <Button type="submit" className="btn-large w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {t("nav.signup")}
        </Button>
      </form>
    </AuthLayout>
  );
}
