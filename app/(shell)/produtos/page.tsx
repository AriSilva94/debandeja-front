"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Upload,
  Plus,
  Pencil,
  Copy,
  Ban,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs } from "@/components/ui/tabs";
import { FilterMenu } from "@/components/ui/filter-menu";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FormError } from "@/components/ui/form-error";
import {
  RowActionsMenu,
  type RowAction,
} from "@/components/ui/row-actions-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { NewProductDrawer } from "@/components/products/new-product-drawer";
import { NewMovementDrawer } from "@/components/movements/new-movement-drawer";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/client";
import {
  useDeactivateProduct,
  useDuplicateProduct,
  useProductCategories,
  useProducts,
  type ProductFilters,
} from "@/lib/api/hooks/use-products";
import type { Product, ProductTab, StockLevel } from "@/lib/api/types";
import { useBranch } from "@/lib/branch-context";
import { usePermission } from "@/lib/api/hooks/use-session";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { SearchField } from "@/components/ui/search-field";
import { ClearFiltersButton } from "@/components/ui/clear-filters-button";
import { ErrorState, LoadingState } from "@/components/ui/query-state";
import { paginationSummary, withPageReset } from "@/lib/pagination";
import { usePageSize } from "@/lib/preferences";

const TAB_LABEL: Record<ProductTab, string> = {
  all: "Todos",
  active: "Ativos",
  inactive: "Inativos",
  alert: "Estoque baixo",
};
const TABS = (["all", "active", "inactive", "alert"] as const).map((value) => ({
  value,
  label: TAB_LABEL[value],
}));

const ALL_STOCK = "Todos";
const STOCK_FILTERS: { label: string; value: StockLevel }[] = [
  { label: "Normal", value: "ok" },
  { label: "Estoque baixo", value: "low" },
  { label: "Sem estoque", value: "out" },
];

const ALL_CATEGORIES = "Todas";

type SortKey = NonNullable<ProductFilters["sortBy"]>;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Produto (A–Z)" },
  { key: "sku", label: "SKU" },
  { key: "price", label: "Preço" },
  { key: "stock", label: "Estoque" },
];

type DisplayStatus = StockLevel | "inactive";

const STOCK_TEXT_TONE: Record<DisplayStatus, string> = {
  out: "text-error-text",
  low: "text-warning-text",
  ok: "text-gray-900",
  inactive: "text-gray-900",
};

const STATUS_BADGE: Record<
  DisplayStatus,
  { tone: "success" | "warning" | "error" | "neutral"; label: string }
> = {
  ok: { tone: "success", label: "Ativo" },
  low: { tone: "warning", label: "Estoque baixo" },
  out: { tone: "error", label: "Sem estoque" },
  inactive: { tone: "neutral", label: "Inativo" },
};

function displayStatus(product: Product): DisplayStatus {
  if (product.level !== "ok") return product.level;
  return product.active ? "ok" : "inactive";
}

export default function ProdutosPage() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("busca") ?? "";

  return <ProdutosContent key={searchFromUrl} initialSearch={searchFromUrl} />;
}

function ProdutosContent({ initialSearch }: { initialSearch: string }) {
  const { branchId } = useBranch();
  const can = usePermission();
  const canEditCatalog = can("products");
  const canMove = can("movements");
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [stockFilter, setStockFilter] = useState(ALL_STOCK);
  const [tab, setTab] = useState<ProductTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementProductId, setMovementProductId] = useState<string | null>(
    null,
  );
  const [deactivateTarget, setDeactivateTarget] = useState<Product | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search.trim());
  const { pageSize, ready: pageSizeReady } = usePageSize();
  const products = useProducts(
    {
      search: debouncedSearch,
      category: category === ALL_CATEGORIES ? undefined : category,
      level: STOCK_FILTERS.find((f) => f.label === stockFilter)?.value,
      tab,
      sortBy: sortKey,
      sortDir,
      page,
      pageSize,
    },
    pageSizeReady,
  );
  const categories = useProductCategories();
  const duplicate = useDuplicateProduct();
  const deactivate = useDeactivateProduct();

  const rows = products.data?.items ?? [];
  const totalProducts = products.data?.total ?? 0;
  const { pageCount, currentPage, rangeLabel } = paginationSummary(
    totalProducts,
    page,
    pageSize,
    "produtos",
    "Nenhum produto encontrado",
  );

  const hasFilters =
    category !== ALL_CATEGORIES ||
    stockFilter !== ALL_STOCK ||
    search.trim() !== "" ||
    tab !== "all";

  const actionError = duplicate.error ?? deactivate.error;

  function clearFilters() {
    setSearch("");
    setCategory(ALL_CATEGORIES);
    setStockFilter(ALL_STOCK);
    setTab("all");
    setPage(1);
  }

  const updateFilter = withPageReset(setPage);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortIndicator(key: SortKey) {
    return sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "";
  }

  function openCreate() {
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setDrawerOpen(true);
  }

  function actionsFor(product: Product): RowAction[] {
    const actions: RowAction[] = [];
    if (canEditCatalog) {
      actions.push({
        label: "Editar produto",
        icon: Pencil,
        onClick: () => openEdit(product),
      });
    }
    if (canMove) {
      actions.push({
        label: "Movimentar estoque",
        icon: ArrowLeftRight,
        onClick: () => setMovementProductId(product.id),
      });
    }
    if (canEditCatalog) {
      actions.push({
        label: "Duplicar",
        icon: Copy,
        onClick: () => duplicate.mutate(product.id),
      });
      if (product.active) {
        actions.push({
          label: "Desativar",
          icon: Ban,
          tone: "destructive",
          onClick: () => setDeactivateTarget(product),
        });
      }
    }
    return actions;
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    deactivate.mutate(deactivateTarget.id);
    setDeactivateTarget(null);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-2xl font-semibold tracking-tight text-gray-900">
            Produtos
          </h1>
          <p className="text-sm text-gray-500">
            Cadastre e gerencie os produtos da sua distribuidora.
          </p>
        </div>
        {canEditCatalog ? (
          <div className="flex gap-2.5">
            <Button variant="secondary">
              <Upload size={15} />
              Importar CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus size={15} />
              Novo produto
            </Button>
          </div>
        ) : null}
      </div>

      <NewProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editingProduct}
        categories={categories.data ?? []}
        categoriesLoading={categories.isPending}
      />
      <NewMovementDrawer
        open={movementProductId !== null}
        onClose={() => setMovementProductId(null)}
        initialProductId={movementProductId ?? undefined}
        initialBranchId={branchId}
      />
      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
        icon={Ban}
        tone="destructive"
        title="Desativar produto?"
        confirmLabel="Desativar produto"
        description={
          <>
            <span className="font-medium text-gray-900">
              {deactivateTarget?.name}
            </span>{" "}
            deixará de ficar disponível para saídas e pedidos. O histórico de
            movimentações é mantido e você pode reativá-lo editando o produto.
          </>
        }
      />

      {actionError ? (
        <FormError>
          {errorMessage(
            actionError,
            "Não foi possível concluir a ação. Tente novamente.",
          )}
        </FormError>
      ) : null}

      <Card>
        <div className="border-b border-gray-200 px-4.5 pt-3">
          <Tabs
            items={TABS.map(({ label, value }) => ({
              label,
              count: products.data?.counts[value] ?? 0,
            }))}
            value={TAB_LABEL[tab]}
            onChange={(label) =>
              updateFilter(setTab)(
                TABS.find((t) => t.label === label)?.value ?? "all",
              )
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 p-3.5">
          <SearchField
            label="Buscar produtos"
            value={search}
            onChange={updateFilter(setSearch)}
            placeholder="Buscar produto, SKU ou marca"
            className="sm:w-80"
          />

          <FilterMenu
            label={category === ALL_CATEGORIES ? "Categoria" : category}
            active={category !== ALL_CATEGORIES}
            selected={category}
            onSelect={updateFilter(setCategory)}
            options={[ALL_CATEGORIES, ...(categories.data ?? []).map((category) => category.name)].map(
              (label) => ({ label }),
            )}
          />

          <FilterMenu
            label={stockFilter === ALL_STOCK ? "Estoque" : stockFilter}
            active={stockFilter !== ALL_STOCK}
            selected={stockFilter}
            onSelect={updateFilter(setStockFilter)}
            options={[ALL_STOCK, ...STOCK_FILTERS.map((f) => f.label)].map(
              (label) => ({ label }),
            )}
          />

          <FilterMenu
            label={`Ordenar: ${SORT_OPTIONS.find((o) => o.key === sortKey)?.label.split(" ")[0]} ${sortDir === "asc" ? "↑" : "↓"}`}
            active={false}
            selected={SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? ""}
            onSelect={(label) => {
              const option = SORT_OPTIONS.find((o) => o.label === label);
              if (option) toggleSort(option.key);
            }}
            options={SORT_OPTIONS.map((o) => ({
              label: o.label,
              sub: sortIndicator(o.key) || undefined,
            }))}
          />

          <div className="flex-1" />

          {hasFilters ? (
            <ClearFiltersButton onClick={clearFilters} label="Limpar filtros" />
          ) : null}
          <span className="whitespace-nowrap text-[13px] text-gray-500">
            {rangeLabel}
          </span>
        </div>

        {products.isPending ? (
          <LoadingState
            title="Carregando produtos"
            description="Buscando o catálogo da sua distribuidora."
          />
        ) : products.isError ? (
          <ErrorState
            title="Não foi possível carregar os produtos"
            onRetry={() => products.refetch()}
          />
        ) : rows.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHeaderCell className="w-11">
                  <Checkbox aria-label="Selecionar todos" />
                </TableHeaderCell>
                <TableHeaderCell>SKU</TableHeaderCell>
                <TableHeaderCell>
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 text-gray-700"
                  >
                    Produto{" "}
                    <span className="text-brand">{sortIndicator("name")}</span>
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>Categoria</TableHeaderCell>
                <TableHeaderCell align="right">
                  <button
                    type="button"
                    onClick={() => toggleSort("price")}
                    className="flex w-full items-center justify-end gap-1"
                  >
                    Preço{" "}
                    <span className="text-brand">{sortIndicator("price")}</span>
                  </button>
                </TableHeaderCell>
                <TableHeaderCell align="right">
                  <button
                    type="button"
                    onClick={() => toggleSort("stock")}
                    className="flex w-full items-center justify-end gap-1"
                  >
                    Estoque{" "}
                    <span className="text-brand">{sortIndicator("stock")}</span>
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="w-14" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((product) => {
                const status = displayStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox aria-label={`Selecionar ${product.name}`} />
                    </TableCell>
                    <TableCell className="text-gray-500 tabular-nums">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[10px] font-semibold text-gray-400">
                          {product.category.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.brand ? (
                            <div className="mt-px text-xs text-gray-400">
                              {product.brand}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.75 text-xs text-gray-600">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={cn("font-semibold", STOCK_TEXT_TONE[status])}
                      >
                        {formatNumber(product.stock)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge tone={STATUS_BADGE[status].tone}>
                        {STATUS_BADGE[status].label}
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      {canEditCatalog || canMove ? (
                        <RowActionsMenu
                          label={`Ações de ${product.name}`}
                          actions={actionsFor(product)}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : hasFilters ? (
          <EmptyState
            icon={Search}
            title="Nenhum produto encontrado"
            description="Ajuste a busca ou remova os filtros aplicados."
            action={<Button onClick={clearFilters}>Limpar filtros</Button>}
          />
        ) : (
          <EmptyState
            icon={Plus}
            title="Nenhum produto cadastrado"
            description="Cadastre o primeiro produto para começar a controlar o estoque."
            action={
              canEditCatalog ? (
                <Button onClick={openCreate}>Novo produto</Button>
              ) : undefined
            }
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4.5 py-3.25">
          <span className="text-[13px] text-gray-500">{rangeLabel}</span>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
}
