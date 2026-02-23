"use client";

import RecipeFeedbackForm from "@/components/RecipeFeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { useRecipeQuery } from "@/hooks/queries";
import { parseHelpers } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const recipeId = typeof id === "string" ? id : id?.[0];
  const { data: recipe, isLoading } = useRecipeQuery(recipeId);
  const [completed, setCompleted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const feedbackSubmittedRef = useRef(false);

  // Recipe is automatically fetched by useRecipeQuery hook
  // No need for manual useEffect to fetch recipe

  // Check if this recipe is completed in weekly progress
  useEffect(() => {
    if (recipe) {
      // TODO: Fetch recipe progress if needed
      const weeklyRecipeProgress: Array<{ recipe_id: string; status: string }> =
        [];
      const progress = weeklyRecipeProgress.find(
        (p) => p.recipe_id === recipe.id && p.status === "completed"
      );
      setCompleted(!!progress);
    }
  }, [recipe]);

  // Listen for dialog close and set completed if feedback was submitted
  const handleDialogOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open && feedbackSubmittedRef.current) {
      setCompleted(true);
      feedbackSubmittedRef.current = false;
    }
  };

  if (isLoading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  // Parse recipe data
  const ingredients = parseHelpers.parseRecipeIngredients(recipe.ingredients);
  const instructions = parseHelpers.parseRecipeInstructions(
    recipe.instructions
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10 relative">
      <div className="w-full max-w-2xl mb-4">
        <Link
          href="/weekly-plan"
          className="inline-flex items-center text-primary hover:underline text-sm font-medium"
        >
          ← Back to Weekly Plan
        </Link>
      </div>
      <Card className="w-full max-w-2xl shadow-cozy border-2 border-[hsl(var(--paprika))]/50 bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            {recipe.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recipe.image_url && (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              width={400}
              height={224}
              className="w-full h-56 object-cover rounded mb-4"
            />
          )}
          <div className="mb-2 text-muted-foreground">
            Cuisine: {recipe.cuisine}
          </div>
          <div className="mb-2 text-muted-foreground">
            Difficulty: {recipe.difficulty}
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Ingredients:</div>
            <ul className="list-disc list-inside text-sm">
              {ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Instructions:</div>
            <ol className="list-decimal list-inside text-sm space-y-2">
              {instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          {/* Mark as Complete Button & Feedback Modal */}
          <div className="flex justify-center mt-8">
            {/* Toggle between dialog and completed button */}
            {!completed ? (
              <>
                <Button
                  className="bg-[hsl(var(--sage))] text-primary px-6 py-2 rounded font-semibold border border-[hsl(var(--paprika))] shadow transition-colors duration-200 hover:bg-[hsl(var(--sage))]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
                  variant="default"
                  size="default"
                  onClick={() => setShowDialog(true)}
                >
                  Mark as Complete
                </Button>
                <Dialog open={showDialog} onOpenChange={handleDialogOpenChange}>
                  <DialogContent className="p-0 max-w-lg bg-white">
                    <RecipeFeedbackForm
                      recipeId={recipe.id}
                      weekNumber={1}
                      // Use a custom prop to notify parent when feedback is submitted
                      onFeedbackSubmitted={() => {
                        feedbackSubmittedRef.current = true;
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button
                className="bg-green-200 text-green-900 px-6 py-2 rounded font-semibold border border-green-400 shadow transition-colors duration-200 hover:bg-green-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                variant="default"
                size="default"
                onClick={() => setCompleted(false)}
              >
                ✓ Completed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
