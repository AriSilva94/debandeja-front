"use client";

import { useState } from "react";
import { Download, Plus, Search, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClearFiltersButton } from "@/components/ui/clear-filters-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterMenu } from "@/components/ui/filter-menu";
import { FormError } from "@/components/ui/form-error";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { MovementTypeBadge } from "@/components/movements/movement-type-badge";
import { NewMovementDrawer } from "@/components/movements/new-movement-drawer";
import { ResponsibleCell } from "@/components/movements/responsible-cell";
import { ProductCell } from "@/components/products/product-cell";
import { errorMessage } from "@/lib/api/client";
import { useMovements, useReverseMovement } from "@/lib/api/hooks/use-movements";
import { useMovementPermissions } from "@/lib/api/hooks/use-session";
import type { Movement, MovementType } from "@/lib/api/types";
import { ALL_BRANCHES_VALUE, branchFilterOptions, useBranch } from "@/lib/branch-context";
import { formatDateTime, formatNumber, formatSigned } from "@/lib/format";
import { paginationSummary, withPageReset } from "@/lib/pagination";
import { PERIOD_DAYS, PERIOD_LABELS, startOfDaysAgo } from "@/lib/period";
import { usePageSize } from "@/lib/preferences";

const ALL_TYPES = "Todos";
const TYPE_FILTERS = [ALL_TYPES, "Entrada", "Saída", "Ajuste"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];
const TYPE_BY_LABEL: Record<Exclude<TypeFilter, typeof ALL_TYPES>, MovementType> = {
  Entrada: "ENTRADA",
  Saída: "SAIDA",
  Ajuste: "AJUSTE",
};

const PERIODS = ["Todo o período", ...PERIOD_LABELS] as const;
type Period = (typeof PERIODS)[number];

function periodStart(period: Period) {
  return period === "Todo o período" ? undefined : startOfDaysAgo(PERIOD_DAYS[period]);
}


function canReverse(movement: Movement) {
  return !movement.reversesMovementId && !movement.reversedBy;
}

export default function MovimentacoesPage() {
  const { branches } = useBranch();
  const { canMove, canRegisterEntries: canReverseAny } = useMovementPermissions();
  const [selectedBranchId, setSelectedBranchId] = useState(ALL_BRANCHES_VALUE);
  const [type, setType] = useState<TypeFilter>(ALL_TYPES);
  const [period, setPeriod] = useState<Period>(PERIODS[0]);
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<Movement | null>(null);

  const branchOptions = branchFilterOptions(branches);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const branchId = selectedBranch?.id;
  const { pageSize, ready: pageSizeReady } = usePageSize();
  const movements = useMovements({
    branchId,
    type: type === ALL_TYPES ? undefined : TYPE_BY_LABEL[type],
    dateFrom,
    page,
    pageSize,
  }, pageSizeReady);
  const reverse = useReverseMovement();

  const rows = movements.data?.items ?? [];
  const total = movements.data?.total ?? 0;
  const { pageCount, currentPage, rangeLabel } = paginationSummary(total, page, pageSize, "movimentações", "Nenhuma movimentação no filtro atual");
  const hasFilters = selectedBranch !== undefined || type !== ALL_TYPES || period !== PERIODS[0];

  const updateFilter = withPageReset(setPage);

  function selectPeriod(value: string) {
    const next = value as Period;
    setPeriod(next);
    setDateFrom(periodStart(next));
    setPage(1);
  }

  function clearFilters() {
    setSelectedBranchId(ALL_BRANCHES_VALUE);
    setType(ALL_TYPES);
    selectPeriod(PERIODS[0]);
  }

  function confirmReverse() {
    if (!reverseTarget) return;
    reverse.mutate(reverseTarget.id);
    setReverseTarget(null);
  }

  return (
    <div className="flex flex-col gap-4.5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">
            Movimentações de estoque
          </h1>
          <p className="text-sm text-gray-500">
            Registro auditável de toda entrada, saída e ajuste.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary">
            <Download size={15} />
            Exportar CSV
          </Button>
          {canMove ? (
            <Button onClick={() => setDrawerOpen(true)}>
              <Plus size={15} />
              Nova movimentação
            </Button>
          ) : null}
        </div>
      </div>

      <NewMovementDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} initialBranchId={branchId} />
      <ConfirmDialog
        open={Boolean(reverseTarget)}
        onClose={() => setReverseTarget(null)}
        onConfirm={confirmReverse}
        icon={Undo2}
        tone="destructive"
        title="Estornar movimentação?"
        confirmLabel="Estornar"
        description={
          reverseTarget ? (
            <>
              Será registrada uma movimentação inversa de{" "}
              <span className="font-medium text-gray-900">
                {formatNumber(Math.abs(reverseTarget.qty))} un.
              </span>{" "}
              de <span className="font-medium text-gray-900">{reverseTarget.product.name}</span> em{" "}
              {reverseTarget.branch.name}. O registro original é mantido no histórico.
            </>
          ) : null
        }
      />

      {reverse.error ? (
        <FormError>{errorMessage(reverse.error, "Não foi possível estornar a movimentação. Tente novamente.")}</FormError>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 p-3.5">
          <FilterMenu
            label={period}
            active={period !== PERIODS[0]}
            selected={period}
            onSelect={selectPeriod}
            options={PERIODS.map((label) => ({ label }))}
          />

          <FilterMenu
            label={selectedBranch?.name ?? branchOptions[0].label}
            active={selectedBranch !== undefined}
            selected={selectedBranchId}
            onSelect={updateFilter(setSelectedBranchId)}
            options={branchOptions}
          />

          <SegmentedControl
            options={TYPE_FILTERS}
            value={type}
            onChange={updateFilter(setType)}
            className="bg-gray-50"
          />

          {hasFilters ? (
            <ClearFiltersButton onClick={clearFilters} />
          ) : null}

          <div className="flex-1" />
          <span className="whitespace-nowrap text-[13px] text-gray-500">
            {formatNumber(total)} movimentações
          </span>
        </div>

        {movements.isPending ? (
          <LoadingState title="Carregando movimentações" description="Buscando o histórico de estoque." />
        ) : movements.isError ? (
          <ErrorState title="Não foi possível carregar as movimentações" onRetry={() => movements.refetch()} />
        ) : rows.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Data e hora</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Produto</TableHeaderCell>
                <TableHeaderCell>Filial</TableHeaderCell>
                <TableHeaderCell align="right">Qtd.</TableHeaderCell>
                <TableHeaderCell align="right">Saldo ant.</TableHeaderCell>
                <TableHeaderCell align="right">Saldo final</TableHeaderCell>
                <TableHeaderCell>Responsável</TableHeaderCell>
                <TableHeaderCell>Observação</TableHeaderCell>
                <TableHeaderCell className="w-24" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((movement, index) => {
                const { date, time } = formatDateTime(movement.createdAt);
                const responsible = movement.member.user.name;
                return (
                  <TableRow key={movement.id}>
                    <TableCell className="tabular-nums">
                      {time}
                      <span className="mt-0.25 block text-xs text-gray-400">{date}</span>
                    </TableCell>
                    <TableCell>
                      <MovementTypeBadge movement={movement} />
                    </TableCell>
                    <TableCell>
                      <ProductCell name={movement.product.name} sku={movement.product.sku} />
                    </TableCell>
                    <TableCell className="text-gray-600">{movement.branch.name}</TableCell>
                    <TableCell align="right" className="font-semibold text-gray-900">
                      {formatSigned(movement.qty)}
                    </TableCell>
                    <TableCell align="right" className="text-gray-500">
                      {formatNumber(movement.balanceBefore)}
                    </TableCell>
                    <TableCell align="right" className="font-medium text-gray-900">
                      {formatNumber(movement.balanceAfter)}
                    </TableCell>
                    <TableCell>
                      <ResponsibleCell name={responsible} index={index} />
                    </TableCell>
                    <TableCell className="max-w-60 text-gray-500">{movement.note}</TableCell>
                    <TableCell align="right">
                      {canReverseAny && canReverse(movement) ? (
                        <button
                          type="button"
                          onClick={() => setReverseTarget(movement)}
                          className="h-7 rounded-lg border border-gray-200 bg-white px-2.25 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Estornar
                        </button>
                      ) : movement.reversedBy ? (
                        <span className="text-xs text-gray-400">Estornada</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhuma movimentação no filtro atual"
            description={
              hasFilters
                ? "Troque o tipo, a filial ou o período para ver os registros."
                : "Registre uma entrada, saída ou ajuste para começar o histórico."
            }
            action={hasFilters ? <Button onClick={clearFilters}>Limpar filtros</Button> : undefined}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4.5 py-3.25">
          <span className="text-[13px] text-gray-500">
            {rangeLabel}
            <span className="text-gray-400"> · Registros não podem ser editados, apenas estornados</span>
          </span>
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
