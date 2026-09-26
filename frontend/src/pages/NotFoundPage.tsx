import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/PageStates";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFoundPage() {
  const { t } = useLanguage();
  useDocumentTitle(t("errors.notFoundTitle"));
  return (
    <EmptyState
      icon={Compass}
      title={t("errors.notFoundTitle")}
      description={t("errors.notFoundDesc")}
      className="mx-auto mt-10 max-w-md"
      action={
        <Button asChild>
          <Link to="/">
            <Home aria-hidden />
            {t("errors.home")}
          </Link>
        </Button>
      }
    />
  );
}
