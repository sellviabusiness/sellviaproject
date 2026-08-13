import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SellViaLogo } from "@/components/brand/sellvia-logo";
import { buttonVariants } from "@/components/ui/button";

/**
 * Not a built feature — the public marketing site (Docs/Scratch/SCREEN_INVENTORY.md §A) is out
 * of scope for Feature 1. This is only a minimal stand-in so the app has a reachable root route
 * and somewhere for "Log in" / "Create account" to point from.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6">
        <SellViaLogo />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
          SellVia
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The public marketing site isn&apos;t built yet — this is a placeholder for Feature 1
          (Authentication) only.
        </p>
        <div className="flex gap-3">
          <Link href="/register" className={buttonVariants({ variant: "primary" })}>
            Create account
          </Link>
        </div>
        <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Log in
        </Link>
      </main>
    </div>
  );
}
