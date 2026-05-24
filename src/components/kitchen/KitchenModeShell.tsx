"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListChecks, X } from "lucide-react";
import { ReactNode } from "react";

interface KitchenModeShellProps {
  recipeName: string;
  stepLabel: string;
  showIngredients: boolean;
  onToggleIngredients: () => void;
  onExit: () => void;
  ingredientsPanel?: ReactNode;
  children: ReactNode;
}

export default function KitchenModeShell({
  recipeName,
  stepLabel,
  showIngredients,
  onToggleIngredients,
  onExit,
  ingredientsPanel,
  children,
}: KitchenModeShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-[hsl(var(--turmeric))]/30">
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--paprika))]/20 bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-primary truncate text-lg">
              {recipeName}
            </h1>
            <p className="text-xs text-muted-foreground">{stepLabel}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleIngredients}
              className={cn(
                "h-10 w-10",
                showIngredients && "bg-amber-100 text-[hsl(var(--paprika))]"
              )}
              aria-label="Toggle ingredients"
            >
              <ListChecks className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="h-10 w-10"
              aria-label="Exit kitchen mode"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {showIngredients && ingredientsPanel && (
        <div className="border-b border-[hsl(var(--paprika))]/20 bg-white/90 px-4 py-4 max-h-[40vh] overflow-y-auto">
          <div className="max-w-lg mx-auto">
            <h2 className="text-sm font-semibold text-primary mb-3">
              Mise en place
            </h2>
            {ingredientsPanel}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
