"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { CRUMBS } from "./nav-items";
import { BranchSwitcher } from "./branch-switcher";
import { UserMenu } from "./user-menu";
import { NotificationsMenu } from "./notifications-menu";
import { GlobalSearch } from "./global-search";

type HeaderProps = {
  tenantName: string;
  showMenuButton: boolean;
  showSearch: boolean;
  showCrumbTenant: boolean;
  label: string;
  onToggleNav: () => void;
};

export function Header({
  tenantName,
  showMenuButton,
  showSearch,
  showCrumbTenant,
  label,
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
        <span className="whitespace-nowrap font-medium text-gray-900">
          {crumb}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {showSearch ? (
          <GlobalSearch label={label} />
        ) : null}

        <BranchSwitcher variant="header" />

        <div className={cn("h-5.5 w-px bg-gray-200")} />

        <NotificationsMenu />
        <UserMenu variant="header" />
      </div>
    </header>
  );
}
