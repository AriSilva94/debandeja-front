import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const variantClasses = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand/30 disabled:bg-gray-200 disabled:text-gray-400",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-brand/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-brand/20",
  destructive:
    "bg-error text-white hover:bg-error-text focus-visible:ring-error/30",
  "destructive-soft":
    "bg-white text-error-text border border-error-border hover:bg-error-bg focus-visible:ring-error/20 disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-white",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-[12.5px] rounded-lg gap-1.5",
  md: "h-[38px] px-4 text-[13.5px] rounded-[10px] gap-2",
  lg: "h-11 px-5 text-[14.5px] rounded-[10px] gap-2",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function buttonVariants(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex items-center justify-center font-semibold cursor-pointer whitespace-nowrap transition-colors",
    "focus-visible:outline-none focus-visible:ring-[3px]",
    "disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants(variant, size), className)}
        {...props}
      >
        {loading ? <Loader2 size={14} strokeWidth={2.6} className="animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
