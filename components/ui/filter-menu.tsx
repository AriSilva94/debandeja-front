"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/use-click-outside";

export type FilterOption = {
  label: string;
  sub?: string;
  value?: string;
};

type FilterMenuProps = {
  label: string;
  active: boolean;
  options: FilterOption[];
  selected: string;
  onSelect: (label: string) => void;
};

export function FilterMenu({ label, active, options, selected, onSelect }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 text-[13.5px] font-medium",
          active ? "border-brand bg-brand-subtle text-brand" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        )}
      >
        {label}
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 top-10.5 z-30 min-w-54 rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md">
          {options.map((option) => {
            const value = option.value ?? option.label;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={value === selected}
                onClick={() => {
                  onSelect(value);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-8.5 w-full items-center justify-between rounded-lg px-2.5 text-[13.5px] hover:bg-gray-100",
                  value === selected ? "bg-brand-subtle font-semibold text-brand" : "text-gray-700",
                )}
              >
                <span>{option.label}</span>
                {option.sub ? <span className="text-xs text-gray-400">{option.sub}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
