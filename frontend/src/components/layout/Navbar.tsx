import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LogIn, LogOut, Menu, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/context/LanguageContext";
import { useSession } from "@/context/SessionContext";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { LanguageSelector } from "./LanguageSelector";
import { isNavItemActive, navItemsFor, type NavItem } from "./navigation";
import { useLogout } from "@/hooks/useLogout";
import { UserMenu } from "./UserMenu";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isActive ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  return (
    <>
      {items.map((item) => {
        const { to, labelKey, icon: Icon } = item;
        const isActive = isNavItemActive(item, pathname);
        return (
          <Link key={to} to={to} className={linkClass({ isActive })} aria-current={isActive ? "page" : undefined} onClick={onNavigate}>
            <Icon className="h-4 w-4" aria-hidden />
            {t(labelKey)}
          </Link>
        );
      })}
    </>
  );
}

export function BottomNav() {
  const { t } = useLanguage();
  const { user } = useSession();
  const { pathname } = useLocation();
  if (!user) return null;
  const items = navItemsFor(user.role);

  return (
    <nav
      aria-label={t("nav.main")}
      className="no-print pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 shadow-[0_-4px_16px_-8px_hsl(200_35%_13%/0.12)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {items.map((item) => {
          const { to, labelKey, icon: Icon } = item;
          const isActive = isNavItemActive(item, pathname);
          return (
            <li key={to} className="min-w-0 flex-1">
              <Link
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-xs font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200",
                    isActive ? "bg-primary-light" : "group-hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="line-clamp-2 break-words">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Navbar() {
  const { t } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const items = navItemsFor(user?.role);
  const logout = useLogout();
  const close = () => setOpen(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container flex h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <BrandLogo to={user ? "/dashboard" : "/"} />

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label={t("nav.main")}>
          <NavLinks items={items} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector />
          {user ? (
            <div className="hidden lg:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden" aria-label={t("nav.menu")}>
                {user ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary" aria-hidden>
                    {initials(user.name)}
                  </span>
                ) : (
                  <Menu aria-hidden />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  {user ? (
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary" aria-hidden>
                        {initials(user.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate">{user.name}</span>
                        <span className="block text-sm font-normal text-muted-foreground">{t(`roles.${user.role}`)}</span>
                      </span>
                    </span>
                  ) : (
                    t("nav.menu")
                  )}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label={t("nav.main")}>
                {!user && <NavLinks items={items} onNavigate={close} />}
                {user ? (
                  <>
                    <NavLink to="/profile" className={linkClass} onClick={close}>
                      <UserRound className="h-4 w-4" aria-hidden />
                      {t("nav.profile")}
                    </NavLink>
                    <button
                      type="button"
                      className={cn(linkClass({ isActive: false }), "mt-4 border-t pt-4 text-destructive hover:bg-emergency-light hover:text-destructive")}
                      onClick={() => {
                        close();
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={linkClass} onClick={close}>
                      <LogIn className="h-4 w-4" aria-hidden />
                      {t("nav.login")}
                    </NavLink>
                    <NavLink to="/signup" className={linkClass} onClick={close}>
                      <UserPlus className="h-4 w-4" aria-hidden />
                      {t("nav.signup")}
                    </NavLink>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
