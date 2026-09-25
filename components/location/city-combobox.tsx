"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input, FieldHint } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useCities } from "@/lib/api/hooks/use-locations";
import { useClickOutside } from "@/lib/use-click-outside";

const MAX_OPTIONS = 80;

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

type CityComboboxProps = {
  id: string;
  uf: string;
  value: string;
  onChange: (city: string) => void;
};

export function CityCombobox({ id, uf, value, onChange }: CityComboboxProps) {
  const cities = useCities(uf);

  if (cities.isError) {
    return (
      <>
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} required />
        <FieldHint>
          Não conseguimos carregar a lista de cidades.{" "}
          <button
            type="button"
            onClick={() => cities.refetch()}
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            Tentar de novo
          </button>{" "}
          ou digite o nome.
        </FieldHint>
      </>
    );
  }

  return (
    <CityList
      id={id}
      options={cities.data ?? []}
      loading={uf !== "" && cities.isPending}
      disabled={uf === ""}
      value={value}
      onChange={onChange}
    />
  );
}

function CityList({
  id,
  options,
  loading,
  disabled,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  loading: boolean;
  disabled: boolean;
  value: string;
  onChange: (city: string) => void;
}) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const normalized = useMemo(() => options.map((city) => ({ city, key: normalize(city) })), [options]);
  const matches = useMemo(() => {
    const term = normalize(query);
    if (!term) return options;
    const starts = normalized.filter((c) => c.key.startsWith(term)).map((c) => c.city);
    const contains = normalized.filter((c) => !c.key.startsWith(term) && c.key.includes(term)).map((c) => c.city);
    return [...starts, ...contains];
  }, [query, options, normalized]);
  const visible = open ? matches.slice(0, MAX_OPTIONS) : [];

  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function close() {
    const exact = normalized.find((c) => c.key === normalize(query));
    if (exact && query.trim()) onChange(exact.city);
    setOpen(false);
    setQuery("");
  }

  useClickOutside(containerRef, close, open);

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => Math.min(Math.max(index + step, 0), Math.max(visible.length - 1, 0)));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const city = visible[activeIndex];
      if (city) select(city);
    } else if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      setQuery("");
    } else if (event.key === "Tab" && open) {
      close();
    }
  }

  const activeOption = open && visible[activeIndex] ? `${listboxId}-${activeIndex}` : undefined;
  const placeholder = disabled
    ? "Escolha o estado primeiro"
    : loading
      ? "Carregando cidades…"
      : open && value
        ? value
        : "Buscar cidade";

  return (
    <div ref={containerRef} className="relative">
      <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption}
        autoComplete="off"
        required
        disabled={disabled || loading}
        value={open ? query : value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="h-[42px] w-full rounded-[10px] border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:ring-[3px] focus:ring-brand/15 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
      />
      {loading ? (
        <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
      ) : null}

      {open ? (
        <div className="absolute left-0 right-0 top-11.5 z-30 rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md">
          <ul ref={listRef} id={listboxId} role="listbox" aria-label="Cidades" className="max-h-64 overflow-y-auto">
            {visible.map((city, index) => (
              <li
                key={city}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={city === value}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(city)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "cursor-pointer truncate rounded-lg px-2.5 py-2 text-[13.5px]",
                  index === activeIndex ? "bg-gray-100" : "",
                  city === value ? "font-semibold text-brand" : "text-gray-700",
                )}
              >
                {city}
              </li>
            ))}
          </ul>
          {matches.length === 0 ? (
            <div className="px-2.5 py-2 text-[13px] text-gray-500">Nenhuma cidade encontrada neste estado.</div>
          ) : null}
          {matches.length > visible.length ? (
            <div className="border-t border-gray-100 px-2.5 pb-1 pt-2 text-xs text-gray-400">
              Mostrando {visible.length} de {matches.length}. Digite para refinar.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
