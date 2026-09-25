import Image from "next/image";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "full" | "mark";
};

const BRAND_IMAGES = {
  full: { src: "/debandeja.png", width: 960, height: 691 },
  mark: { src: "/debandeja-mark.png", width: 256, height: 256 },
} as const;

export function BrandLogo({ className, priority = false, variant = "full" }: BrandLogoProps) {
  const image = BRAND_IMAGES[variant];

  return (
    <Image
      src={image.src}
      alt="Debandeja"
      width={image.width}
      height={image.height}
      priority={priority}
      className={cn("h-auto object-contain", className)}
    />
  );
}
