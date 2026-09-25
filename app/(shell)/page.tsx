"use client";
import { useState } from "react";
import { Package, Boxes, TriangleAlert, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { BranchSwitcher } from "@/components/layout/branch-switcher";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { BranchStockCard } from "@/components/dashboard/branch-stock-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { RecentMovementsCard } from "@/components/dashboard/recent-movements-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { NewMovementDrawer } from "@/components/movements/new-movement-drawer";
import { useDashboardSummary, useStockAlerts } from "@/lib/api/hooks/use-dashboard";
import { useMe } from "@/lib/api/hooks/use-me";
import type { StockAlert } from "@/lib/api/types";
import { useBranch } from "@/lib/branch-context";
import { useMovementPermissions } from "@/lib/api/hooks/use-session";
import { formatNumber, formatCount, formatSigned } from "@/lib/format";
import { PERIOD_DAYS, PERIOD_LABELS, startOfDaysAgo, type PeriodLabel } from "@/lib/period";
import { LoadingState } from "@/components/ui/query-state";

const ALERTS_SHOWN = 5;
const EMPTY = "—";

function greeting(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

type MovementTarget = { productId?: string; branchId?: string };

export default function DashboardPage() {
  const { branchId, isAllBranches } = useBranch();
  const [period, setPeriod] = useState<PeriodLabel>(PERIOD_LABELS[1]);
  const [dateFrom, setDateFrom] = useState(() =>
    startOfDaysAgo(PERIOD_DAYS[PERIOD_LABELS[1]]),
  );
  const [movementTarget, setMovementTarget] = useState<MovementTarget | null>(
    null,
  );

  const me = useMe();
  const { canMove, canRegisterEntries: canRestock } = useMovementPermissions();
  const summary = useDashboardSummary({ branchId, dateFrom });
  const alerts = useStockAlerts(branchId);
  const data = summary.data;

  function selectPeriod(next: PeriodLabel) {
    setPeriod(next);
    setDateFrom(startOfDaysAgo(PERIOD_DAYS[next]));
  }

  function restock(alert: StockAlert) {
    setMovementTarget({
      productId: alert.product.id,
      branchId: alert.branch.id,
    });
  }

  const firstName = me.data?.name.split(" ")[0];
  const title = firstName
    ? `${greeting(new Date().getHours())}, ${firstName}`
    : " ";

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 min-h-8 text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-sm text-gray-500">
            Acompanhe o que está acontecendo na sua distribuidora.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <BranchSwitcher variant="page" />
          <PeriodSelector value={period} onChange={selectPeriod} />
        </div>
      </div>

      {summary.isError || alerts.isError ? (
        <FormError className="flex flex-wrap items-center justify-between gap-3">
          Não foi possível carregar todos os dados do painel.
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              summary.refetch();
              alerts.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </FormError>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-4">
        <KpiCard
          label="Produtos cadastrados"
          value={data ? formatNumber(data.totalProducts) : EMPTY}
          delta={data ? formatSigned(data.newProductsInPeriod) : EMPTY}
          context={`novos · ${period.toLowerCase()}`}
          icon={Package}
          tone="brand"
        />
        <KpiCard
          label="Itens em estoque"
          value={data ? formatNumber(data.totalStockItems) : EMPTY}
          delta={data ? formatSigned(data.stockItemsDeltaInPeriod) : EMPTY}
          context={`saldo movimentado · ${period.toLowerCase()}`}
          icon={Boxes}
          tone="success"
        />
        <KpiCard
          label="Estoque baixo"
          value={data ? formatNumber(data.lowStockCount) : EMPTY}
          delta={
            data ? `${formatNumber(data.outOfStockCount)} sem estoque` : EMPTY
          }
          context="requer reposição"
          icon={TriangleAlert}
          tone="warning"
        />
        {isAllBranches ? (
          <KpiCard
            label="Filiais"
            value={
              data
                ? formatNumber(
                    data.activeBranchesCount + data.inactiveBranchesCount,
                  )
                : EMPTY
            }
            delta={
              data ? formatCount(data.activeBranchesCount, "ativa", "ativas") : EMPTY
            }
            context={
              data && data.inactiveBranchesCount > 0
                ? formatCount(data.inactiveBranchesCount, "inativa", "inativas")
                : "todas operando"
            }
            icon={Building2}
            tone="neutral"
          />
        ) : (
          <KpiCard
            label="Itens reservados"
            value={data ? formatNumber(data.reservedItems) : EMPTY}
            delta="em pedidos"
            context="nesta filial"
            icon={Building2}
            tone="neutral"
          />
        )}
      </div>

      {data && alerts.data ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
            <BranchStockCard
              branches={data.byBranch}
              totalItems={data.totalStockItems}
            />
            <AlertsCard
              alerts={alerts.data.slice(0, ALERTS_SHOWN)}
              totalCount={alerts.data.length}
              outOfStockCount={data.outOfStockCount}
              isAllBranches={isAllBranches}
              onRestock={canRestock ? restock : undefined}
            />
          </div>

          <RecentMovementsCard
            movements={data.recentMovements}
            totalCount={data.movementsInPeriod}
            periodLabel={period}
            onNewMovement={canMove ? () => setMovementTarget({ branchId }) : undefined}
          />
        </>
      ) : summary.isPending || alerts.isPending ? (
        <Card>
          <LoadingState title="Carregando painel" description="Buscando estoque, alertas e movimentações." />
        </Card>
      ) : null}

      <NewMovementDrawer
        open={movementTarget !== null}
        onClose={() => setMovementTarget(null)}
        initialProductId={movementTarget?.productId}
        initialBranchId={movementTarget?.branchId}
      />
    </div>
  );
}
