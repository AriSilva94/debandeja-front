"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOverlayDialog } from "@/lib/use-overlay-dialog";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconTone?: "brand" | "error";
  footer?: ReactNode;
  widthClassName?: string;
  children?: ReactNode;
};

const ICON_TONE_CLASSES = {
  brand: "bg-brand-subtle text-brand",
  error: "bg-error-bg text-error",
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconTone = "brand",
  footer,
  widthClassName = "w-120",
  children,
}: ModalProps) {
  const { closeButtonRef, descriptionId, dialogRef, titleId } = useOverlayDialog(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/45 p-4">
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[85vh] max-w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-lg",
          widthClassName,
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5.5 pt-5">
          <div className="flex gap-3">
            {Icon ? (
              <div
                className={cn(
                  "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px]",
                  ICON_TONE_CLASSES[iconTone],
                )}
              >
                <Icon size={18} strokeWidth={1.9} />
              </div>
            ) : null}
            <div>
              <div id={titleId} className="text-[17px] font-semibold text-gray-900">{title}</div>
              {description ? (
                <div id={descriptionId} className="mt-0.5 text-[13px] text-gray-500">{description}</div>
              ) : null}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar diálogo"
            onClick={onClose}
            className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {children ? <div className="overflow-y-auto px-5.5 py-5">{children}</div> : null}

        {footer ? (
          <div className="flex justify-end gap-2.5 border-t border-gray-200 bg-gray-50 px-5.5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
