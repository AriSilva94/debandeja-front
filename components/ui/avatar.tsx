import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "w-6 h-6 text-[10.5px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
} as const;

const toneClasses = {
  brand: "bg-brand",
  accent: "bg-accent",
  gray: "bg-gray-600",
  warning: "bg-warning-text",
  info: "bg-info-text",
} as const;

type AvatarSize = keyof typeof sizeClasses;
type AvatarTone = keyof typeof toneClasses;

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: AvatarSize;
  tone?: AvatarTone;
}

export function Avatar({ initials, size = "md", tone = "brand", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full text-white font-semibold flex items-center justify-center shrink-0",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  );
}

export const AVATAR_TONES: AvatarTone[] = ["brand", "accent", "gray", "warning", "info"];
