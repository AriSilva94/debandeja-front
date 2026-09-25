import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FormError({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[10px] border border-error-border bg-error-bg px-3 py-2.5 text-[13px] text-error-text",
        className,
      )}
    >
      {children}
    </div>
  );
}
