import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full h-[42px] appearance-none rounded-[10px] border border-gray-200 bg-white pl-3 pr-9 text-sm text-gray-900 outline-none",
            "focus:border-brand focus:ring-[3px] focus:ring-brand/15",
            "disabled:bg-gray-100 disabled:text-gray-400",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
