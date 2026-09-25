"use client";

import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { CRUMBS } from "./nav-items";
import { BranchSwitcher } from "./branch-switcher";
import { UserMenu } from "./user-menu";
import { NotificationsMenu } from "./notifications-menu";

type HeaderProps = {
  tenantName: string;
  showMenuButton: boolean;
  showSearch: boolean;
  showCrumbTenant: boolean;
  onToggleNav: () => void;
};

export function Header({
  tenantName,
  showMenuButton,
  showSearch,
  showCrumbTenant,
  onToggleNav,
}: HeaderProps) {
  const pathname = usePathname();
  const crumb = CRUMBS[pathname] ?? "Dashboard";

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2.5 border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex min-w-0 items-center gap-2.5 text-[13px]">
        {showMenuButton ? (
          <button
            type="button"
            aria-label="Abrir menu principal"
            onClick={onToggleNav}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50"
          >
            <Menu size={17} className="text-gray-600" />
          </button>
        ) : null}
        {showCrumbTenant ? (
          <>
            <span className="truncate text-gray-500">{tenantName}</span>
            <span className="text-gray-300">/</span>
          </>
        ) : null}
        <span className="whitespace-nowrap font-medium text-gray-900">{crumb}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {showSearch ? (
          <button
            type="button"
            className="flex h-8.5 w-65 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-2.5 text-sm text-gray-400 hover:border-gray-300"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Buscar produto, SKU, movimentação…</span>
            <span className="rounded-[5px] border border-gray-200 bg-white px-1.5 py-px text-[11px] text-gray-500">
              ⌘K
            </span>
          </button>
        ) : null}

        <BranchSwitcher variant="header" />

        <div className={cn("h-5.5 w-px bg-gray-200")} />

        <NotificationsMenu />
        <UserMenu variant="header" />
      </div>
    </header>
  );
}
