import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { EmptyState } from "@/components/common/PageStates";
import { safeRedirectPath } from "@/lib/storage";
import type { Role } from "@/types/api";

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user } = useSession();
  const { t } = useLanguage();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) {
    return <EmptyState icon={ShieldAlert} title={t("errors.forbidden")} className="mx-auto mt-10 max-w-md" />;
  }
  return <Outlet />;
}

export function GuestOnly() {
  const { user } = useSession();
  const location = useLocation();
  if (user) return <Navigate to={safeRedirectPath((location.state as { from?: string } | null)?.from)} replace />;
  return <Outlet />;
}
