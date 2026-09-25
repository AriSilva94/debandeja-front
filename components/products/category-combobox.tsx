"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/use-click-outside";
import type { ProductCategory } from "@/lib/api/types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

type CategoryComboboxProps = {
  id: string;
  categories: ProductCategory[];
  value: ProductCategory | null;
  loading?: boolean;
  error?: boolean;
  describedBy?: string;
  onChange: (category: ProductCategory) => void;
};

export function CategoryCombobox({
  id,
  categories,
  value,
  loading = false,
  error = false,
  describedBy,
  onChange,
}: CategoryComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term) return categories;
    return categories.filter((category) => normalize(category.name).includes(term));
  }, [categories, query]);
  const otherCategory = categories.find((category) => normalize(category.name) === "outros");

  function close() {
    setOpen(false);
    setQuery("");
  }

  useClickOutside(containerRef, close, open);

  function select(category: ProductCategory) {
    onChange(category);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") close();
    if (event.key === "Enter" && open && matches[0]) {
      event.preventDefault();
      select(matches[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        name="category"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={error}
        aria-describedby={describedBy}
        autoComplete="off"
        required
        disabled={loading}
        value={open ? query : value?.name ?? ""}
        placeholder={loading ? "Carregando categorias…" : "Buscar categoria"}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-[42px] w-full rounded-[10px] border bg-white pl-9 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-[3px] disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
          error ? "border-error focus:ring-error/15" : "border-gray-200 focus:border-brand focus:ring-brand/15",
        )}
      />
      {loading ? (
        <Loader2 size={15} className="absolute right-3 top-1/2 animate-spin -translate-y-1/2 text-gray-400" />
      ) : (
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      )}
      {open ? (
        <div className="absolute left-0 right-0 top-11.5 z-30 overflow-hidden rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md">
          <ul id={listboxId} role="listbox" aria-label="Categorias" className="max-h-56 overflow-y-auto">
            {matches.map((category) => (
              <li key={category.id} role="option" aria-selected={category.id === value?.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(category)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13.5px] text-gray-700 hover:bg-gray-100"
                >
                  {category.name}
                  {category.id === value?.id ? <Check size={15} className="text-brand" aria-label="Selecionada" /> : null}
                </button>
              </li>
            ))}
          </ul>
          {matches.length === 0 ? (
            <div className="border-t border-gray-100 px-2.5 py-2 text-[13px] text-gray-500">
              <p>Nenhuma categoria encontrada.</p>
              {otherCategory ? (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(otherCategory)}
                  className="mt-1 font-medium text-brand hover:text-brand-dark"
                >
                  Usar Outros
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
