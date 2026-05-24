"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface IngredientChecklistProps {
  ingredients: string[];
  checkedIndices: Set<number>;
  onToggle: (index: number) => void;
}

export default function IngredientChecklist({
  ingredients,
  checkedIndices,
  onToggle,
}: IngredientChecklistProps) {
  return (
    <ul className="space-y-2">
      {ingredients.map((ingredient, index) => {
        const checked = checkedIndices.has(index);
        return (
          <li key={index}>
            <button
              type="button"
              onClick={() => onToggle(index)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-colors",
                checked
                  ? "border-green-500/50 bg-green-50/80 text-muted-foreground"
                  : "border-[hsl(var(--paprika))]/30 bg-white hover:border-[hsl(var(--paprika))]/50"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5",
                  checked
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-[hsl(var(--paprika))]/40"
                )}
              >
                {checked && <Check className="w-4 h-4" />}
              </span>
              <span className={cn("flex-1", checked && "line-through")}>
                {ingredient}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
