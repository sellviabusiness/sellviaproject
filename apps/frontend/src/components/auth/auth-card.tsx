import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { SellViaLogo } from "@/components/brand/sellvia-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * The one bordered card every auth screen renders inside — logo top-left, theme toggle
 * top-right (both inside the card, per the reference design), then whatever content each
 * screen passes in (AuthHeader + AuthFlowForm). Single source of truth for that top row so it
 * never has to be duplicated per screen.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Card className="w-full p-6 sm:p-7">
      <div className="mb-4 flex items-center justify-between">
        <SellViaLogo height={28} />
        <ThemeToggle />
      </div>
      {children}
    </Card>
  );
}
