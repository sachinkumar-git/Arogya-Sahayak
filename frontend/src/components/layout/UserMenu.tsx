import { useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useLogout } from "@/hooks/useLogout";
import { initials } from "@/lib/format";
import type { User } from "@/types/api";

export function UserMenu({ user }: { user: User }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const logout = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2" aria-label={user.name}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-[10rem] truncate lg:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t(`roles.${user.role}`)} · {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/profile")}>
          <UserRound aria-hidden />
          {t("nav.profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={logout}>
          <LogOut aria-hidden />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
