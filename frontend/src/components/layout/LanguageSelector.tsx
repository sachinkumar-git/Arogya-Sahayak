import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { useSaveLanguage } from "@/hooks/api/useProfile";
import type { LanguageCode } from "@/types/api";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const { user, meta } = useSession();
  const saveLanguage = useSaveLanguage();
  const current = meta.languages.find((l) => l.code === language);

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    if (user && user.preferredLanguage !== code) saveLanguage.mutate(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`${t("common.language")}: ${current?.label ?? ""}`}>
          <Languages aria-hidden />
          <span className="hidden min-[400px]:inline" aria-hidden>
            {current?.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {meta.languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onSelect={() => choose(lang.code)} lang={lang.code}>
            <Check className={language === lang.code ? "opacity-100" : "opacity-0"} aria-hidden />
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
