"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, PackageSearch, Search, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/api/hooks/use-products";
import { useStock } from "@/lib/api/hooks/use-stock";
import { useDebouncedValue } from "@/lib/use-debounced-value";

type GlobalSearchProps = {
  label: string;
};

type SearchResult = {
  id: string;
  group: "Produtos" | "Estoque";
  title: string;
  subtitle: string;
  href: string;
};

const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 5;

export function GlobalSearch({ label }: GlobalSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = useDebouncedValue(value.trim(), 250);
  const enabled = open && query.length >= MIN_QUERY_LENGTH;
  const products = useProducts(
    { search: query, tab: "active", sortBy: "name", pageSize: RESULTS_LIMIT },
    enabled,
  );
  const stock = useStock({ search: query, pageSize: RESULTS_LIMIT }, enabled);

  const productResults: SearchResult[] = (products.data?.items ?? []).map((product) => ({
    id: `product-${product.id}`,
    group: "Produtos",
    title: product.name,
    subtitle: `${product.sku}${product.brand ? ` · ${product.brand}` : ""}`,
    href: `/produtos?busca=${encodeURIComponent(value.trim())}`,
  }));
  const stockResults: SearchResult[] = (stock.data?.items ?? []).map((row) => ({
    id: `stock-${row.id}`,
    group: "Estoque",
    title: row.product.name,
    subtitle: `${row.product.sku} · ${row.branch.name}`,
    href: `/estoque?busca=${encodeURIComponent(value.trim())}`,
  }));
  const results = [...productResults, ...stockResults];
  const hasQuery = value.trim().length > 0;
  const isLoading = enabled && (products.isPending || stock.isPending);
  const hasError = enabled && (products.isError || stock.isError);

  const highlightedIndex = results.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), results.length - 1);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function selectResult(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex(Math.min(highlightedIndex + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex(Math.max(highlightedIndex - 1, 0));
      return;
    }
    const activeResult = results[highlightedIndex];
    if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      selectResult(activeResult);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex h-8.5 w-65 items-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-2.5 text-sm text-gray-900 focus-within:border-brand focus-within:bg-white focus-within:ring-[3px] focus-within:ring-brand/15">
        <Search size={15} className="shrink-0 text-gray-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-controls={hasQuery ? listboxId : undefined}
          aria-expanded={open && hasQuery}
          aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-${highlightedIndex}` : undefined}
          placeholder={label}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {open && hasQuery ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {value.trim().length < MIN_QUERY_LENGTH ? (
            <p className="px-4 py-3 text-sm text-gray-500">Digite ao menos 2 caracteres para buscar.</p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Buscando produtos e estoque…
            </div>
          ) : hasError ? (
            <p className="px-4 py-3 text-sm text-error-text">Não foi possível realizar a busca. Tente novamente.</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Nenhum produto ou item de estoque encontrado.</p>
          ) : (
            <div id={listboxId} role="listbox" aria-label="Resultados da busca" className="py-1.5">
              <ResultGroup title="Produtos" icon={PackageSearch} results={productResults} activeIndex={highlightedIndex} offset={0} listboxId={listboxId} onSelect={selectResult} onHover={setActiveIndex} />
              {stockResults.length > 0 ? (
                <ResultGroup title="Estoque" icon={Warehouse} results={stockResults} activeIndex={highlightedIndex} offset={productResults.length} listboxId={listboxId} onSelect={selectResult} onHover={setActiveIndex} />
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

type ResultGroupProps = {
  title: SearchResult["group"];
  icon: typeof PackageSearch;
  results: SearchResult[];
  activeIndex: number;
  offset: number;
  listboxId: string;
  onSelect: (result: SearchResult) => void;
  onHover: (index: number) => void;
};

function ResultGroup({ title, icon: Icon, results, activeIndex, offset, listboxId, onSelect, onHover }: ResultGroupProps) {
  if (results.length === 0) return null;

  return (
    <section className="py-1">
      <p className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500">
        <Icon size={14} />
        {title}
      </p>
      {results.map((result, index) => {
        const resultIndex = offset + index;
        return (
          <button
            key={result.id}
            id={`${listboxId}-${resultIndex}`}
            type="button"
            role="option"
            aria-selected={activeIndex === resultIndex}
            onClick={() => onSelect(result)}
            onMouseMove={() => onHover(resultIndex)}
            className={`flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50 ${activeIndex === resultIndex ? "bg-brand-soft" : ""}`}
          >
            <span className="truncate text-sm font-medium text-gray-900">{result.title}</span>
            <span className="truncate text-xs text-gray-500">{result.subtitle}</span>
          </button>
        );
      })}
    </section>
  );
}
