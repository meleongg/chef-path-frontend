"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";

interface SwapRecipeModalProps {
  isOpen: boolean;
  recipeName: string;
  recipeId: string;
  weekNumber: number;
  onClose: () => void;
  onConfirm: (context: string) => Promise<void>;
  isLoading?: boolean;
}

export default function SwapRecipeModal({
  isOpen,
  recipeName,
  recipeId,
  weekNumber,
  onClose,
  onConfirm,
  isLoading = false,
}: SwapRecipeModalProps) {
  const [swapContext, setSwapContext] = useState("");

  const handleConfirm = async () => {
    if (swapContext.trim().length === 0) return;

    try {
      await onConfirm(swapContext);
      setSwapContext("");
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSwapContext("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-[hsl(var(--paprika))]/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Swap Recipe
          </DialogTitle>
          <DialogDescription>
            Replace this recipe with an AI-powered suggestion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipe Being Swapped */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-muted-foreground">Current Recipe</p>
            <p className="font-semibold text-[hsl(var(--paprika))]">
              {recipeName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Week {weekNumber}
            </p>
          </div>

          {/* Swap Context Input */}
          <div className="space-y-2">
            <label
              htmlFor="swap-context"
              className="text-sm font-medium text-gray-700"
            >
              Why do you want to swap this recipe?
            </label>
            <p className="text-xs text-muted-foreground">
              Tell us what you'd prefer instead. This helps our AI find the
              perfect replacement.
            </p>
            <Textarea
              id="swap-context"
              value={swapContext}
              onChange={(e) => setSwapContext(e.target.value)}
              placeholder="E.g., 'I want something vegetarian', 'Need a faster recipe', 'Allergic to dairy', 'Want more protein'"
              maxLength={500}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {swapContext.length}/500
            </p>
          </div>

          {/* Character count */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Pro tip:</strong> Be specific! The more details you
              provide, the better our AI can find a suitable replacement.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={swapContext.trim().length === 0 || isLoading}
            className="min-w-[120px] bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 hover:from-orange-600 hover:to-[hsl(var(--paprika))]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Finding replacement...
              </span>
            ) : (
              "Swap Recipe"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
