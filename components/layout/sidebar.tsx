"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  Building2,
  Check,
  Plus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ALL_BRANCHES_VALUE,
  useBranch,
  type BranchOption,
} from "@/lib/branch-context";
import { useMyTenants, useSelectTenant } from "@/lib/api/hooks/use-me";
import { SCREEN_PATH } from "@/lib/post-auth";
import { usePermission, useSessionContext } from "@/lib/api/hooks/use-session";
import { useStockAlerts } from "@/lib/api/hooks/use-dashboard";
import { initials } from "@/lib/avatar";
import { ROLE_LABEL } from "@/lib/roles";
import { UserMenu } from "./user-menu";
import { useClickOutside } from "@/lib/use-click-outside";
import { BrandLogo } from "@/components/brand-logo";
import { NAV_ITEMS, NAV_BOTTOM_ITEMS, type NavItem } from "./nav-items";

type SidebarProps = {
  collapsed: boolean;
  tenantName: string;
};

export function Sidebar({ collapsed, tenantName }: SidebarProps) {
  const pathname = usePathname();
  const { branchId, branchLabel, options, setBranchId } = useBranch();
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const showLabels = !collapsed;
  const session = useSessionContext().data;
  const can = usePermission();
  const alertsCount = useStockAlerts().data?.length ?? 0;
  const subscription = session?.subscription;
  const trial =
    subscription?.status === "TRIAL" && subscription.trialDaysRemaining !== null
      ? subscription
      : null;
  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.requires || can(item.requires, "READ"),
  );
  const switcherRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    switcherRef,
    () => {
      setTenantMenuOpen(false);
      setBranchMenuOpen(false);
    },
    tenantMenuOpen || branchMenuOpen,
  );

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div
        className={cn(
          "flex h-18 items-center border-b border-brand-subtle-border bg-brand-subtle/55",
          showLabels ? "justify-start gap-2.5 px-3.5" : "justify-center px-2",
        )}
      >
        <BrandLogo variant="mark" className="w-11 rounded-[10px]" priority />
        {showLabels ? (
          <div className="min-w-0">
            <div className="text-[17px] font-bold tracking-[-0.02em] text-brand-dark">
              Debandeja
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-dark">
              Gestão de bebidas
            </div>
          </div>
        ) : null}
      </div>

      {showLabels ? (
        <div ref={switcherRef} className="relative px-3 pb-3.5 pt-3.5">
          <div className="overflow-hidden rounded-xl border border-brand-subtle-border bg-white shadow-xs">
            <button
              type="button"
              onClick={() => {
                setTenantMenuOpen((v) => !v);
                setBranchMenuOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 p-2.5 transition-colors hover:bg-brand-subtle"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand text-[11px] font-semibold text-white">
                  {initials(tenantName)}
                </span>
                <span className="min-w-0 text-left">
                  <span className="block truncate text-[12.5px] font-semibold text-gray-900">
                    {tenantName}
                  </span>
                  <span className="block text-[11px] text-gray-400">
                    {subscription
                      ? subscription.onTrial
                        ? "Trial"
                        : `Plano ${subscription.planName}`
                      : null}
                  </span>
                </span>
              </span>
              <ChevronsUpDown size={14} className="shrink-0 text-gray-400" />
            </button>
            <div className="h-px bg-brand-subtle-border" />
            <button
              type="button"
              onClick={() => {
                setBranchMenuOpen((v) => !v);
                setTenantMenuOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-2.5 py-2.5 transition-colors hover:bg-brand-subtle"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Building2 size={14} className="shrink-0 text-brand" />
                <span className="truncate text-[12.5px] font-medium text-gray-700">
                  {branchLabel}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-md bg-brand-subtle px-1.5 py-0.5 text-[10.5px] font-semibold text-brand">
                  FILIAL
                </span>
                <ChevronDown size={13} className="text-gray-400" />
              </span>
            </button>
          </div>

          {tenantMenuOpen ? (
            <TenantMenu
              currentTenantId={session?.tenant.id}
              onClose={() => setTenantMenuOpen(false)}
            />
          ) : null}
          {branchMenuOpen ? (
            <BranchMenu
              options={options}
              activeValue={branchId ?? ALL_BRANCHES_VALUE}
              onSelect={(value) => {
                setBranchId(value);
                setBranchMenuOpen(false);
              }}
              onClose={() => setBranchMenuOpen(false)}
            />
          ) : null}
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {showLabels ? (
          <div className="px-2 pb-2 pt-1.5 text-[10.5px] font-semibold tracking-widest text-brand/60">
            OPERAÇÃO
          </div>
        ) : null}
        <div className="flex flex-col gap-0.5">
          {visibleNav.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
              count={
                item.href === "/estoque" && alertsCount > 0
                  ? String(alertsCount)
                  : undefined
              }
            />
          ))}
        </div>
        <div className="mx-2 my-3.5 h-px bg-brand-subtle-border" />
        <div className="flex flex-col gap-0.5">
          {NAV_BOTTOM_ITEMS.map((item) => (
            <NavButton
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-brand-subtle-border p-3">
        {showLabels && trial ? (
          <div className="mb-2.5 rounded-[10px] border border-brand-subtle-border bg-brand-subtle p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand">
                Trial · {trial.trialDaysRemaining}{" "}
                {trial.trialDaysRemaining === 1 ? "dia" : "dias"}
              </span>
              <span className="text-[11px] text-brand/75">
                {trial.trialDays - (trial.trialDaysRemaining ?? 0)}/
                {trial.trialDays}
              </span>
            </div>
            <progress
              value={trial.trialDays - (trial.trialDaysRemaining ?? 0)}
              max={trial.trialDays}
              aria-label="Dias de trial usados"
              className="mb-2 block h-1 w-full overflow-hidden rounded-sm [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-brand-subtle-border [&::-webkit-progress-value]:bg-brand"
            />
            {can("billing", "WRITE") ? (
              <Link
                href="/assinatura"
                className="flex h-7.5 w-full items-center justify-center rounded-lg bg-brand text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Escolher plano
              </Link>
            ) : null}
          </div>
        ) : null}
        <UserMenu variant="sidebar" collapsed={collapsed} />
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  collapsed,
  count,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  count?: string;
}) {
  const NavIcon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex h-10 w-full items-center rounded-[10px] text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25",
        collapsed ? "justify-center gap-0" : "justify-start gap-2.5 px-2.5",
        active
          ? "bg-brand font-semibold text-white shadow-xs"
          : "text-gray-700 hover:bg-brand-subtle hover:text-brand-dark",
      )}
    >
      <NavIcon
        size={17}
        strokeWidth={active ? 2.1 : 1.8}
        className={cn("shrink-0", active && "text-accent")}
      />
      {!collapsed ? (
        <span className="flex-1 text-left">{item.label}</span>
      ) : null}
      {!collapsed && count ? (
        <span
          aria-label={`${count} alertas de estoque`}
          className="rounded-md border border-error-border bg-error-bg px-1.5 py-px text-[11px] font-semibold text-error-text"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function TenantMenu({
  currentTenantId,
  onClose,
}: {
  currentTenantId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const tenants = useMyTenants();
  const selectTenant = useSelectTenant();

  function select(tenantId: string) {
    if (tenantId === currentTenantId) {
      onClose();
      return;
    }
    selectTenant.mutate(tenantId, {
      onSuccess: ({ screen }) => {
        onClose();
        router.push(SCREEN_PATH[screen]);
      },
    });
  }

  return (
    <div className="absolute left-3 right-3 top-[calc(100%-8px)] z-40 max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-brand-subtle-border bg-white p-2 shadow-md">
      <div className="px-2.5 pb-2 pt-1.5 text-[11px] font-semibold tracking-wide text-gray-400">
        SUAS DISTRIBUIDORAS
      </div>
      {(tenants.data ?? []).map((tenant) => (
        <button
          key={tenant.tenantId}
          type="button"
          disabled={selectTenant.isPending}
          onClick={() => select(tenant.tenantId)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-gray-100 disabled:opacity-60"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand text-[11px] font-semibold text-white">
            {initials(tenant.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-gray-900">
              {tenant.name}
            </span>
            <span className="block text-[11.5px] text-gray-400">
              {ROLE_LABEL[tenant.role]}
            </span>
          </span>
          {tenant.tenantId === currentTenantId ? (
            <Check size={15} className="text-brand" />
          ) : null}
        </button>
      ))}
      <div className="my-1.5 flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg p-2.5">
        <span className="mt-px text-[11.5px] leading-relaxed text-warning-text">
          Trocar de distribuidora muda todo o contexto de dados: produtos,
          estoque e equipe.
        </span>
      </div>
      <div className="my-1.5 h-px bg-gray-200" />
      <Link
        href="/onboarding"
        onClick={onClose}
        className="flex h-8.5 w-full items-center gap-2 rounded-lg px-2.5 text-[13px] text-gray-700 hover:bg-gray-100"
      >
        <Plus size={14} className="text-gray-500" />
        Criar nova distribuidora
      </Link>
    </div>
  );
}

type BranchMenuProps = {
  options: BranchOption[];
  activeValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  className?: string;
};

export function BranchMenu({
  options,
  activeValue,
  onSelect,
  onClose,
  className,
}: BranchMenuProps) {
  return (
    <div
      className={cn(
        "absolute left-3 right-3 top-[calc(100%-8px)] z-40 max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border border-brand-subtle-border bg-white p-2 shadow-md",
        className,
      )}
    >
      <div className="px-2.5 pb-2 pt-1.5 text-[11px] font-semibold tracking-wide text-gray-400">
        FILIAL ATIVA
      </div>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={cn(
            "flex h-8.5 w-full items-center justify-between rounded-lg px-2.5 text-[13.5px] hover:bg-gray-100",
            option.value === activeValue
              ? "bg-brand-subtle font-semibold text-brand"
              : "text-gray-700",
          )}
        >
          <span>{option.label}</span>
          <span className="text-[11.5px] text-gray-400">{option.sub}</span>
        </button>
      ))}
      <div className="my-1.5 h-px bg-gray-200" />
      <Link
        href="/filiais"
        onClick={onClose}
        className="flex h-8.5 w-full items-center gap-2 rounded-lg px-2.5 text-[13px] text-gray-700 hover:bg-gray-100"
      >
        <Building2 size={14} className="text-gray-500" />
        Gerenciar filiais
      </Link>
    </div>
  );
}
