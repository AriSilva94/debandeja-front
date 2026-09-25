import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { StockAlert } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";

type StockAlertRowProps = {
  alert: StockAlert;
  action?: ReactNode;
  className?: string;
};

export function StockAlertRow({ alert, action, className }: StockAlertRowProps) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-gray-100 last:border-0", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", alert.level === "low" ? "bg-warning" : "bg-error")} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">{alert.product.name}</div>
        <div className="mt-0.5 truncate text-[12.5px] text-gray-500">
          {alert.product.sku} · {alert.branch.name}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">{formatNumber(alert.current)}</div>
        <div className="text-xs text-gray-400">mín. {formatNumber(alert.min)}</div>
      </div>
      <Badge tone={alert.level === "low" ? "warning" : "error"} className="whitespace-nowrap">
        {alert.level === "low" ? "Baixo" : "Sem estoque"}
      </Badge>
      {action}
    </div>
  );
}
