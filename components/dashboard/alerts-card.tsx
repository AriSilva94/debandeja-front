import Link from "next/link";
import { Plus, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StockAlert } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { StockAlertRow } from "@/components/stock/stock-alert-row";

type AlertsCardProps = {
  alerts: StockAlert[];
  totalCount: number;
  outOfStockCount: number;
  isAllBranches: boolean;
  onRestock?: (alert: StockAlert) => void;
};

export function AlertsCard({ alerts, totalCount, outOfStockCount, isAllBranches, onRestock }: AlertsCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-200 px-4.5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[15.5px] font-semibold">Alertas de estoque</span>
          <Badge tone="error">{totalCount} itens</Badge>
        </div>
        <Link href="/estoque" className="text-[13px] font-medium text-brand hover:text-brand-dark">
          Ver todos
        </Link>
      </div>
      <div className="flex-1">
        {alerts.map((alert) => (
          <StockAlertRow
            key={`${alert.product.id}-${alert.branch.id}`}
            alert={alert}
            className="px-4.5 py-3.25 hover:bg-gray-50"
            action={
              onRestock ? (
                <button
                  type="button"
                  aria-label={`Criar entrada para ${alert.product.name} em ${alert.branch.name}`}
                  onClick={() => onRestock(alert)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100"
                >
                  <Plus size={14} className="text-gray-600" />
                </button>
              ) : null
            }
          />
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50 px-4.5 py-3">
        <TriangleAlert size={15} className="text-warning-text" />
        <span className="text-[12.5px] text-gray-500">
          {formatNumber(outOfStockCount)} {outOfStockCount === 1 ? "item está" : "itens estão"} sem estoque{" "}
          {isAllBranches ? "em pelo menos uma filial" : "nesta filial"}.
        </span>
      </div>
    </Card>
  );
}
