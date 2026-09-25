"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BranchProvider } from "@/lib/branch-context";
import { useSessionContext } from "@/lib/api/hooks/use-session";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SubscriptionBanner } from "./subscription-banner";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [width, setWidth] = useState<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const context = useSessionContext().data;
  const tenantName = context?.tenant.name ?? "";

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rail = width !== null && width < 1180 && width >= 900;
  const hideNav = width !== null && width < 900;

  return (
    <BranchProvider>
      <div data-density={context?.preferences.density} className="relative flex h-screen overflow-hidden bg-background">
        {hideNav && navOpen ? (
          <div onClick={() => setNavOpen(false)} className="absolute inset-0 z-70 bg-gray-900/45" />
        ) : null}

        <div
          className={cn(
            "border-r border-gray-200 bg-white",
            hideNav
              ? cn(
                  "absolute inset-y-0 left-0 z-80 w-[min(16.5rem,calc(100vw-1.5rem))] shadow-md transition-transform",
                  navOpen ? "translate-x-0" : "-translate-x-full",
                )
              : cn("shrink-0", rail ? "w-18" : "w-60"),
          )}
        >
          <Sidebar collapsed={rail && !hideNav} tenantName={tenantName} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header
            tenantName={tenantName}
            showMenuButton={hideNav}
            showSearch={width === null || width >= 1120}
            showCrumbTenant={width === null || width >= 640}
            label="Buscar produtos, SKUs ou movimentações"
            onToggleNav={() => setNavOpen((v) => !v)}
          />
          <SubscriptionBanner />
          <main className="flex-1 overflow-y-auto" onClick={() => setNavOpen(false)}>
            {children}
          </main>
        </div>
      </div>
    </BranchProvider>
  );
}
