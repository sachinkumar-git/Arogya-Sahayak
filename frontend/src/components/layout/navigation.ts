import { FileText, LayoutDashboard, Pill, PlusCircle, Stethoscope, type LucideIcon } from "lucide-react";
import type { Role } from "@/types/api";

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}

const dashboard: NavItem = { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard };
const consultations: NavItem = {
  to: "/consultations",
  labelKey: "nav.consultations",
  icon: Stethoscope,
  match: (pathname) => (pathname.startsWith("/consultations") && pathname !== "/consultations/new") || pathname.startsWith("/patients/"),
};
const medicines: NavItem = { to: "/medicines", labelKey: "nav.medicines", icon: Pill };

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  patient: [
    dashboard,
    consultations,
    { to: "/consultations/new", labelKey: "nav.book", icon: PlusCircle },
    { to: "/records", labelKey: "nav.records", icon: FileText },
    medicines,
  ],
  sahayak: [dashboard, consultations, { to: "/consultations/new", labelKey: "nav.newAssisted", icon: PlusCircle }, medicines],
  doctor: [dashboard, consultations, medicines],
};

export const isNavItemActive = (item: NavItem, pathname: string) =>
  item.match ? item.match(pathname) : pathname === item.to || pathname.startsWith(`${item.to}/`);

export const navItemsFor = (role?: Role): NavItem[] => (role ? NAV_BY_ROLE[role] : [medicines]);
