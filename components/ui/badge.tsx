import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const toneClasses = {
  success: "text-success-text bg-success-bg border-success-border",
  warning: "text-warning-text bg-warning-bg border-warning-border",
  error: "text-error-text bg-error-bg border-error-border",
  info: "text-info-text bg-info-bg border-info-border",
  brand: "text-brand bg-brand-subtle border-brand-subtle-border",
  neutral: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

export type BadgeTone = keyof typeof toneClasses;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[7px] border px-2 py-[3px] text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
