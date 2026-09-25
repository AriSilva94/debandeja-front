import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, wrapperClassName, label, disabled, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2.5 select-none",
          disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-700",
          wrapperClassName,
        )}
      >
        <span className="relative mt-px flex items-center justify-center w-4.25 h-4.25 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            disabled={disabled}
            className={cn(
              "peer appearance-none w-4.25 h-4.25 rounded-[5px] border bg-white",
              "checked:bg-brand checked:border-brand",
              disabled ? "border-gray-200 bg-gray-100" : "border-gray-300",
              className,
            )}
            {...props}
          />
          <Check
            size={11}
            strokeWidth={3.2}
            className="pointer-events-none absolute hidden text-white peer-checked:block"
          />
        </span>
        {label ? <span className="text-[13.5px]">{label}</span> : null}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
