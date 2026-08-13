import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Intrinsic size of public/logo.png (the real, unmodified logo asset) — used to scale the
// rendered size without distorting the artwork's actual proportions.
const NATIVE_WIDTH = 205;
const NATIVE_HEIGHT = 70;

/**
 * The real SellVia logo (public/logo.png), rendered at its own aspect ratio — no cropping, no
 * circular mask, no added border/ring, no recoloring. `height` controls the rendered size;
 * width is derived from it so the artwork is never stretched or squashed.
 */
export function SellViaLogo({
  className,
  height = 28,
  asLink = true,
}: {
  className?: string;
  height?: number;
  asLink?: boolean;
}) {
  const width = Math.round((NATIVE_WIDTH / NATIVE_HEIGHT) * height);

  const img = (
    <Image
      src="/logo.png"
      alt="SellVia"
      width={width}
      height={height}
      className={cn("h-auto w-auto", className)}
      priority
    />
  );

  if (!asLink) return img;

  return (
    <Link
      href="/"
      className="inline-flex rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {img}
    </Link>
  );
}
