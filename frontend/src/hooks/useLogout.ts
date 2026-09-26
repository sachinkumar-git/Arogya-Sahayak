import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api";

export function useLogout() {
  const { logout } = useSession();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  return async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      toast({ description: t("auth.loggedOut") });
    } catch (err) {
      toast({ title: t("common.error"), description: errorMessage(err), variant: "destructive" });
    }
  };
}
