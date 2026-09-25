"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOverlayDialog } from "@/lib/use-overlay-dialog";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  widthClassName?: string;
  children: ReactNode;
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  widthClassName = "w-140",
  children,
}: DrawerProps) {
  const { closeButtonRef, descriptionId, dialogRef, titleId } = useOverlayDialog(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-gray-900/45">
      <div
        aria-hidden="true"
        className="flex-1 cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn("flex h-full max-w-full flex-col bg-white shadow-lg", widthClassName)}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5.5 py-4.5">
          <div>
            <div id={titleId} className="text-lg font-semibold text-gray-900">{title}</div>
            {description ? (
              <div id={descriptionId} className="mt-0.5 text-[13px] text-gray-500">{description}</div>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar painel"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-gray-200 bg-white hover:bg-gray-50"
          >
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5.5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3.5 sm:px-5.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
