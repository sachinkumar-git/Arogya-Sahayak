import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/FormField";
import { PasswordInput } from "@/components/common/PasswordInput";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";
import { safeRedirectPath } from "@/lib/storage";

const DEMO_PASSWORD = "Arogya@123";
const DEMO_ACCOUNTS = [
  { role: "patient", email: "patient@arogya.demo" },
  { role: "sahayak", email: "sahayak@arogya.demo" },
  { role: "doctor", email: "doctor@arogya.demo" },
] as const;
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === "true";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const user = await login(email, password);
      toast({ description: t("auth.welcome", { name: user.name }) });
      navigate(safeRedirectPath((location.state as { from?: string } | null)?.from), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            {t("nav.signup")}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField label={t("auth.email")}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>
        <FormField label={t("auth.password")}>
          <PasswordInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </FormField>
        <Button type="submit" className="btn-large w-full" disabled={pending || !email || !password}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {t("nav.login")}
        </Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-6 space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary-light/40 p-4">
          <p className="text-sm font-medium">{t("auth.demoAccounts")}</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.role}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                {t(`roles.${account.role}`)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("auth.demoHint", { password: DEMO_PASSWORD })}</p>
        </div>
      )}
    </AuthLayout>
  );
}
