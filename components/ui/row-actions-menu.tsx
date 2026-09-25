"use client";

import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/lib/use-click-outside";

export type RowAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "default" | "destructive";
};

type RowActionsMenuProps = {
  actions: RowAction[];
  label?: string;
};

export function RowActionsMenu({ actions, label = "Ações" }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100"
      >
        <MoreHorizontal size={14} className="text-gray-600" />
      </button>
      {open ? (
        <div className="absolute right-0 top-8.5 z-30 min-w-52 rounded-[10px] border border-gray-200 bg-white p-1.5 shadow-md">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={cn(
                "flex h-8.5 w-full items-center gap-2.25 rounded-lg px-2.5 text-[13.5px]",
                action.tone === "destructive"
                  ? "text-error-text hover:bg-error-bg"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <action.icon size={15} strokeWidth={1.9} />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
