import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowLeftRight,
  Building2,
  Users,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { PermissionModule } from "@/lib/api/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requires?: PermissionModule;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { href: "/filiais", label: "Filiais", icon: Building2, requires: "branches" },
  { href: "/equipe", label: "Equipe", icon: Users, requires: "team" },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard, requires: "billing" },
];

export const NAV_BOTTOM_ITEMS: NavItem[] = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export const CRUMBS: Record<string, string> = {
  "/": "Dashboard",
  "/produtos": "Produtos",
  "/estoque": "Estoque",
  "/movimentacoes": "Movimentações",
  "/filiais": "Filiais",
  "/equipe": "Equipe",
  "/assinatura": "Assinatura",
  "/configuracoes": "Configurações",
};
