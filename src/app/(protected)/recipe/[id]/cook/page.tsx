"use client";

import IngredientChecklist from "@/components/kitchen/IngredientChecklist";
import KitchenModeShell from "@/components/kitchen/KitchenModeShell";
import StepNavigator from "@/components/kitchen/StepNavigator";
import RecipeFeedbackForm from "@/components/RecipeFeedbackForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { useUser } from "@/hooks";
import {
  useRecipeQuery,
  useToggleRecipeStatusMutation,
  useWeeklyRecipeProgressQuery,
} from "@/hooks/queries";
import { useKitchenSession } from "@/hooks/useKitchenSession";
import { parseHelpers } from "@/lib/api";
import { resolveRecipeWeek } from "@/lib/recipeWeek";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

type CookPhase = "cooking" | "feedback";

export default function KitchenCookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { state } = useApp();
  const weekNumber = resolveRecipeWeek(searchParams, state.currentWeek);
  const recipeId = resolvedParams.id;

  const [phase, setPhase] = useState<CookPhase>("cooking");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const updateStatusMutation = useToggleRecipeStatusMutation();

  const { data: recipe, isLoading } = useRecipeQuery(recipeId);
  const { data: recipeProgress } = useWeeklyRecipeProgressQuery(
    user?.id,
    weekNumber
  );

  const ingredients = recipe
    ? parseHelpers.parseRecipeIngredients(recipe.ingredients)
    : [];
  const steps = recipe
    ? parseHelpers.parseRecipeInstructionsStructured(recipe.instructions)
    : [];

  const session = useKitchenSession({
    recipeId,
    weekNumber,
    stepCount: steps.length,
  });

  const progressEntry = recipeProgress?.find((p) => p.recipe_id === recipeId);
  const existingFeedback = progressEntry?.feedback
    ? {
        feedback: progressEntry.feedback,
        notes: progressEntry.notes,
      }
    : undefined;

  useEffect(() => {
    if (!user?.id) return;
    const status = progressEntry?.status;
    if (status === "completed") {
      router.replace(`/recipe/${recipeId}?week=${weekNumber}`);
      return;
    }
    if (status === "in_progress") return;
    updateStatusMutation.mutate({
      userId: user.id,
      recipeId,
      weekNumber,
      request: { status: "in_progress" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate once when status is known
  }, [user?.id, recipeId, weekNumber, progressEntry?.status]);

  const confirmExit = () => {
    setShowExitDialog(false);
    router.push(`/recipe/${recipeId}?week=${weekNumber}`);
  };

  if (isLoading || !recipe || !session.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-[hsl(var(--turmeric))]/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--paprika))]" />
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-[hsl(var(--turmeric))]/30 px-4 py-8 overflow-visible">
        <div className="max-w-lg mx-auto overflow-visible">
          <RecipeFeedbackForm
            variant="inline"
            recipeId={recipeId}
            weekNumber={weekNumber}
            existingFeedback={existingFeedback}
            onFeedbackSubmitted={() => {
              session.clearSession();
              router.push(`/weekly-plan`);
            }}
          />
        </div>
      </div>
    );
  }

  const stepLabel =
    steps.length > 0
      ? `Step ${session.currentStepIndex + 1} of ${steps.length}`
      : "Kitchen mode";

  return (
    <>
      <KitchenModeShell
        recipeName={recipe.name}
        stepLabel={stepLabel}
        showIngredients={session.showIngredients}
        onToggleIngredients={() =>
          session.setShowIngredients(!session.showIngredients)
        }
        onExit={() => setShowExitDialog(true)}
        ingredientsPanel={
          <IngredientChecklist
            ingredients={ingredients}
            checkedIndices={session.checkedIngredients}
            onToggle={session.toggleIngredient}
          />
        }
      >
        <StepNavigator
          steps={steps}
          currentIndex={session.currentStepIndex}
          onPrevious={() => session.goToStep(session.currentStepIndex - 1)}
          onNext={() => session.goToStep(session.currentStepIndex + 1)}
          onFinish={() => setPhase("feedback")}
        />
      </KitchenModeShell>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent
          showCloseButton={false}
          className="bg-white border-2 border-[hsl(var(--paprika))]/30 sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-primary">
              Leave kitchen mode?
            </DialogTitle>
            <DialogDescription>
              Your progress is saved. You can resume cooking anytime from your
              weekly plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setShowExitDialog(false)}
            >
              Keep cooking
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-[hsl(var(--paprika))] hover:bg-[hsl(var(--primary))]/90 text-white"
              onClick={confirmExit}
            >
              Leave kitchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
