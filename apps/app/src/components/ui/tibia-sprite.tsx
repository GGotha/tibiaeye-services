import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

interface TibiaSpriteProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TibiaSprite({ src, alt, size = "md", className }: TibiaSpriteProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setStatus("loading");
    retriesRef.current = 0;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [src]);

  const handleError = useCallback(() => {
    if (retriesRef.current < MAX_RETRIES) {
      retriesRef.current += 1;
      setStatus("loading");
      timerRef.current = setTimeout(() => {
        setStatus((prev) => (prev === "loading" ? "loading" : prev));
      }, RETRY_DELAY_MS);
      return;
    }
    setStatus("error");
  }, []);

  if (status === "error") {
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

  const separator = src.includes("?") ? "&" : "?";
  const imgSrc = retriesRef.current > 0 ? `${src}${separator}_r=${retriesRef.current}` : src;

  return (
    <div className={cn("relative", SIZE_MAP[size], className)}>
      {status === "loading" && (
        <div
          className={cn(
            "absolute inset-0 rounded bg-slate-800/50 animate-pulse",
          )}
        />
      )}
      <img
        src={imgSrc}
        alt={alt}
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        loading="lazy"
        onLoad={() => setStatus("loaded")}
        onError={handleError}
        className={cn(
          SIZE_MAP[size],
          "object-contain [image-rendering:pixelated]",
          status === "loading" && "opacity-0",
        )}
      />
    </div>
  );
}
