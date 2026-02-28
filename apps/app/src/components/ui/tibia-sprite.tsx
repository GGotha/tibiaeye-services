import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useState } from "react";

const SIZE_MAP = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-16 w-16",
} as const;

const SIZE_PX = {
  sm: 24,
  md: 32,
  lg: 64,
} as const;

interface TibiaSpriteProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TibiaSprite({ src, alt, size = "md", className }: TibiaSpriteProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-slate-800/50",
          SIZE_MAP[size],
          className
        )}
      >
        <ImageOff className="h-3 w-3 text-slate-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={SIZE_PX[size]}
      height={SIZE_PX[size]}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(SIZE_MAP[size], "object-contain [image-rendering:pixelated]", className)}
    />
  );
}
