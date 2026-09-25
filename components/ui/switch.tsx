import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full transition-colors",
          "bg-gray-200 has-checked:bg-brand",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className={cn("peer sr-only", className)}
          {...props}
        />
        <span className="ml-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-transform peer-checked:translate-x-[18px]" />
      </label>
    );
  },
);
Switch.displayName = "Switch";
