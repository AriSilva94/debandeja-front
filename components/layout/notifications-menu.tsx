"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import { StockAlertRow } from "@/components/stock/stock-alert-row";
import { useStockAlerts } from "@/lib/api/hooks/use-dashboard";
import { usePermission } from "@/lib/api/hooks/use-session";
import { useBranch } from "@/lib/branch-context";
import { formatNumber } from "@/lib/format";
import { useClickOutside } from "@/lib/use-click-outside";

const MAX_LISTED = 6;

export function NotificationsMenu() {
  const canSeeStock = usePermission()("stock", "READ");
  const { branchId, branchLabel } = useBranch();
  const alerts = useStockAlerts(branchId, canSeeStock).data ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const count = alerts.length;
  const label = count > 0 ? `Notificações: ${count} ${count === 1 ? "alerta" : "alertas"} de estoque` : "Notificações";

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8.5 w-8.5 items-center justify-center rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/30"
      >
        <Bell size={16} className="text-gray-600" />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-error px-1 text-[10.5px] font-semibold text-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Notificações"
          className="absolute right-0 top-10.5 z-40 w-90 rounded-xl border border-gray-200 bg-white shadow-md max-sm:fixed max-sm:inset-x-4 max-sm:top-24 max-sm:w-auto"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="text-sm font-semibold text-gray-900">Alertas de estoque</div>
            <div className="mt-0.5 text-xs text-gray-500">{branchLabel}</div>
          </div>
          {!canSeeStock ? (
            <p className="px-4 py-6 text-center text-[13px] text-gray-500">Nenhuma notificação por aqui.</p>
          ) : count === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <CheckCircle2 size={20} className="text-success" />
              <p className="text-[13px] text-gray-500">Nenhum produto abaixo do mínimo.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {alerts.slice(0, MAX_LISTED).map((alert) => (
                <StockAlertRow
                  key={`${alert.product.id}-${alert.branch.id}`}
                  alert={alert}
                  className="px-4 py-2.75"
                />
              ))}
            </div>
          )}
          {count > 0 ? (
            <Link
              href="/estoque"
              onClick={() => setOpen(false)}
              className="block rounded-b-xl border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-center text-[13px] font-medium text-brand hover:text-brand-dark"
            >
              {count > MAX_LISTED ? `Ver os ${formatNumber(count)} alertas no estoque` : "Ver estoque"}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
