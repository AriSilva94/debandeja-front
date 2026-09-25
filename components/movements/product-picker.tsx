"use client";

import { useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProducts } from "@/lib/api/hooks/use-products";
import type { Product } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { useClickOutside } from "@/lib/use-click-outside";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const RESULTS_LIMIT = 20;

export type PickedProduct = Pick<Product, "id" | "name" | "sku">;

type ProductPickerProps = {
  id: string;
  value: PickedProduct | undefined;
  onChange: (product: PickedProduct) => void;
};

function productLabel(product: PickedProduct) {
  return `${product.name} — ${product.sku}`;
}

export function ProductPicker({ id, value, onChange }: ProductPickerProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const search = useDebouncedValue(query.trim());
  const results = useProducts({ search, tab: "active", sortBy: "name", pageSize: RESULTS_LIMIT });
  const items = open ? (results.data?.items ?? []) : [];
  const total = results.data?.total ?? 0;

  function close() {
    setOpen(false);
    setQuery("");
  }

  useClickOutside(containerRef, close, open);

  function select(product: PickedProduct) {
    onChange(product);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), Math.max(items.length - 1, 0)));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const product = items[activeIndex];
      if (product) select(product);
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      close();
    }
  }

  const activeOption = open && items[activeIndex] ? `${listboxId}-${items[activeIndex].id}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption}
        autoComplete="off"
        value={open ? query : value ? productLabel(value) : ""}
        placeholder={open && value ? productLabel(value) : "Buscar por nome, SKU ou marca"}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="h-[42px] w-full rounded-[10px] border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:ring-[3px] focus:ring-brand/15"
      />
      {open && results.isFetching ? (
        <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-11.5 z-30 rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md">
          <ul id={listboxId} role="listbox" aria-label="Produtos" className="max-h-64 overflow-y-auto">
            {items.map((product, index) => (
              <li
                key={product.id}
                id={`${listboxId}-${product.id}`}
                role="option"
                aria-selected={product.id === value?.id}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(product)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[13.5px]",
                  index === activeIndex ? "bg-gray-100" : "",
                  product.id === value?.id ? "font-semibold text-brand" : "text-gray-700",
                )}
              >
                <span className="min-w-0 truncate">{product.name}</span>
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                  {product.sku} · {formatNumber(product.stock)} un.
                </span>
              </li>
            ))}
          </ul>
          {results.isSuccess && items.length === 0 ? (
            <div className="px-2.5 py-2 text-[13px] text-gray-500">Nenhum produto ativo encontrado.</div>
          ) : null}
          {total > items.length && items.length > 0 ? (
            <div className="border-t border-gray-100 px-2.5 pt-2 pb-1 text-xs text-gray-400">
              Mostrando {items.length} de {formatNumber(total)}. Digite para refinar a busca.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
