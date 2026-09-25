"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterMenu } from "@/components/ui/filter-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { RailStatCard } from "@/components/ui/rail-stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { NewMovementDrawer } from "@/components/movements/new-movement-drawer";
import { cn } from "@/lib/cn";
import { useStock } from "@/lib/api/hooks/use-stock";
import type { StockLevel } from "@/lib/api/types";
import { ALL_BRANCHES_VALUE, branchFilterOptions, useBranch } from "@/lib/branch-context";
import { formatNumber } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { usePermission } from "@/lib/api/hooks/use-session";
import { SearchField } from "@/components/ui/search-field";
import { ClearFiltersButton } from "@/components/ui/clear-filters-button";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { paginationSummary, withPageReset } from "@/lib/pagination";
import { usePageSize } from "@/lib/preferences";

const ALL_STATUSES = "Todos";
const STATUS_LABEL: Record<StockLevel, string> = { ok: "Normal", low: "Baixo", out: "Sem estoque" };
const STATUSES = (["ok", "low", "out"] as const).map((value) => ({ value, label: STATUS_LABEL[value] }));

const CURRENT_TEXT_TONE: Record<StockLevel, string> = {
  out: "text-error-text",
  low: "text-warning-text",
  ok: "text-gray-900",
};

const STATUS_BADGE_TONE: Record<StockLevel, "success" | "warning" | "error"> = {
  ok: "success",
  low: "warning",
  out: "error",
};


type MovementTarget = { productId?: string; branchId?: string };

export default function EstoquePage() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("busca") ?? "";

  return <EstoqueContent key={searchFromUrl} initialSearch={searchFromUrl} />;
}

function EstoqueContent({ initialSearch }: { initialSearch: string }) {
  const { branches } = useBranch();
  const canMove = usePermission()("movements");
  const [search, setSearch] = useState(initialSearch);
  const [selectedBranchId, setSelectedBranchId] = useState(ALL_BRANCHES_VALUE);
  const [status, setStatus] = useState(ALL_STATUSES);
  const [page, setPage] = useState(1);
  const [movementTarget, setMovementTarget] = useState<MovementTarget | null>(null);

  const branchOptions = branchFilterOptions(branches);
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const branchId = selectedBranch?.id;
  const debouncedSearch = useDebouncedValue(search.trim());
  const { pageSize, ready: pageSizeReady } = usePageSize();
  const stock = useStock({
    search: debouncedSearch,
    branchId,
    status: STATUSES.find((s) => s.label === status)?.value,
    page,
    pageSize,
  }, pageSizeReady);

  const rows = stock.data?.items ?? [];
  const total = stock.data?.total ?? 0;
  const kpis = stock.data?.kpis;
  const { pageCount, currentPage, rangeLabel } = paginationSummary(total, page, pageSize, "registros", "Nenhum registro encontrado");
  const hasFilters = search.trim() !== "" || selectedBranch !== undefined || status !== ALL_STATUSES;

  const updateFilter = withPageReset(setPage);

  function clearFilters() {
    setSearch("");
    setSelectedBranchId(ALL_BRANCHES_VALUE);
    setStatus(ALL_STATUSES);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4.5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500">Acompanhe o estoque dos produtos por filial.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary">
            <Download size={15} />
            Exportar
          </Button>
          {canMove ? (
            <Button onClick={() => setMovementTarget({ branchId })}>
              <Plus size={15} />
              Nova movimentação
            </Button>
          ) : null}
        </div>
      </div>

      <NewMovementDrawer
        open={movementTarget !== null}
        onClose={() => setMovementTarget(null)}
        initialProductId={movementTarget?.productId}
        initialBranchId={movementTarget?.branchId}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-4">
        <RailStatCard
          label="Total de itens"
          value={formatNumber(kpis?.totalItems ?? 0)}
          context={selectedBranch?.name ?? `${branches.length} filiais`}
          tone="neutral"
        />
        <RailStatCard
          label="Estoque baixo"
          value={String(kpis?.lowCount ?? 0)}
          context="abaixo do mínimo"
          tone="low"
        />
        <RailStatCard
          label="Sem estoque"
          value={String(kpis?.outCount ?? 0)}
          context="reposição urgente"
          tone="out"
        />
        <RailStatCard
          label="Reservado"
          value={formatNumber(kpis?.reserved ?? 0)}
          context="em pedidos abertos"
          tone="info"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 p-3.5">
          <SearchField label="Buscar estoque" value={search} onChange={updateFilter(setSearch)} placeholder="Buscar produto ou SKU" className="sm:w-75" />

          <FilterMenu
            label={selectedBranch?.name ?? branchOptions[0].label}
            active={selectedBranch !== undefined}
            selected={selectedBranchId}
            onSelect={updateFilter(setSelectedBranchId)}
            options={branchOptions}
          />

          <FilterMenu
            label={status === ALL_STATUSES ? "Status" : status}
            active={status !== ALL_STATUSES}
            selected={status}
            onSelect={updateFilter(setStatus)}
            options={[ALL_STATUSES, ...STATUSES.map((s) => s.label)].map((label) => ({ label }))}
          />

          {hasFilters ? (
            <ClearFiltersButton onClick={clearFilters} />
          ) : null}

          <div className="flex-1" />
          <span className="whitespace-nowrap text-[13px] text-gray-500">{formatNumber(total)} registros</span>
        </div>

        {stock.isPending ? (
          <LoadingState title="Carregando estoque" description="Buscando os saldos por filial." />
        ) : stock.isError ? (
          <ErrorState title="Não foi possível carregar o estoque" onRetry={() => stock.refetch()} />
        ) : rows.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell>Produto</TableHeaderCell>
                <TableHeaderCell>SKU</TableHeaderCell>
                <TableHeaderCell>Filial</TableHeaderCell>
                <TableHeaderCell align="right">Atual</TableHeaderCell>
                <TableHeaderCell align="right">Mínimo</TableHeaderCell>
                <TableHeaderCell align="right">Reservado</TableHeaderCell>
                <TableHeaderCell align="right">Disponível</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="w-38" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-gray-900">{row.product.name}</TableCell>
                  <TableCell className="text-gray-500 tabular-nums">{row.product.sku}</TableCell>
                  <TableCell className="text-gray-600">{row.branch.name}</TableCell>
                  <TableCell align="right">
                    <span className={cn("font-semibold", CURRENT_TEXT_TONE[row.level])}>
                      {formatNumber(row.current)}
                    </span>
                  </TableCell>
                  <TableCell align="right" className="text-gray-500">
                    {formatNumber(row.minStock)}
                  </TableCell>
                  <TableCell align="right" className="text-gray-500">
                    {formatNumber(row.reserved)}
                  </TableCell>
                  <TableCell align="right" className="font-medium text-gray-900">
                    {formatNumber(row.available)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={STATUS_BADGE_TONE[row.level]}>{STATUS_LABEL[row.level]}</Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-1.5">
                      {canMove ? (
                      <button
                        type="button"
                        onClick={() => setMovementTarget({ productId: row.product.id, branchId: row.branch.id })}
                        className="h-7 rounded-lg border border-gray-200 bg-white px-2.25 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Movimentar
                      </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhum registro de estoque"
            description={
              hasFilters
                ? "Nenhum item corresponde à filial, status ou busca selecionados."
                : "Cadastre produtos para acompanhar os saldos por filial."
            }
            action={hasFilters ? <Button onClick={clearFilters}>Limpar filtros</Button> : undefined}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4.5 py-3.25">
          <span className="text-[13px] text-gray-500">{rangeLabel}</span>
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
