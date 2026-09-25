import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-[42px] px-3 rounded-[10px] border bg-white text-sm text-gray-900 outline-none transition-shadow",
          "placeholder:text-gray-400",
          "disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200",
          error
            ? "border-error focus:ring-[3px] focus:ring-error/15"
            : "border-gray-200 focus:border-brand focus:ring-[3px] focus:ring-brand/15",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-[13px] font-medium text-gray-700 mb-1.5", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 mt-1.5 text-xs text-error-text">
      <span className="font-bold">!</span>
      {children}
    </div>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <div className="mt-1.5 text-xs text-gray-500">{children}</div>;
}
