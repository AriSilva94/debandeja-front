"use client";

import { useRef, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { ALL_BRANCHES_VALUE, useBranch } from "@/lib/branch-context";
import { useClickOutside } from "@/lib/use-click-outside";
import { BranchMenu } from "./sidebar";

type BranchSwitcherVariant = "header" | "page";

const TRIGGER_CLASSES: Record<BranchSwitcherVariant, string> = {
  header: "h-8.5 border-gray-200 bg-white px-2.5 hover:border-brand",
  page: "h-9 border-gray-200 bg-white px-3 hover:border-gray-300",
};

const MENU_CLASSES: Record<BranchSwitcherVariant, string> = {
  header: "left-auto right-0 top-10 w-62",
  page: "left-auto right-0 top-11 w-62",
};

export function BranchSwitcher({ variant = "header" }: { variant?: BranchSwitcherVariant }) {
  const { branchId, branchLabel, options, setBranchId } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Selecionar filial. Atual: ${branchLabel}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-[10px] border text-[13px]",
          TRIGGER_CLASSES[variant],
        )}
      >
        <Building2 size={15} className="text-brand" />
        <span className="font-medium text-gray-700">
          {variant === "page" ? `Filial: ${branchLabel}` : branchLabel}
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open ? (
        <BranchMenu
          options={options}
          activeValue={branchId ?? ALL_BRANCHES_VALUE}
          onSelect={(value) => {
            setBranchId(value);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          className={MENU_CLASSES[variant]}
        />
      ) : null}
    </div>
  );
}
