"use client";

import RecipeFeedbackForm from "@/components/RecipeFeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser } from "@/hooks";
import { api, parseHelpers } from "@/lib/api";
import { Recipe } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const weekNumber = parseInt(searchParams.get("week") || "1");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [hasFeedback, setHasFeedback] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoading(true);
        const recipeData = await api.getRecipe(resolvedParams.id);
        setRecipe(recipeData);

        // Fetch existing feedback if user is logged in
        if (user) {
          const feedback = await api.getRecipeProgress(
            user.id,
            resolvedParams.id,
            weekNumber
          );
          if (feedback) {
            setExistingFeedback(feedback);
            // Only mark as having feedback if status is completed
            setHasFeedback(feedback.status === "completed");
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.id) {
      loadRecipe();
    }
  }, [resolvedParams.id, user, weekNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Recipe not found"}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ingredients = parseHelpers.parseRecipeIngredients(recipe.ingredients);
  const tags = parseHelpers.parseRecipeTags(recipe.tags);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-[hsl(var(--turmeric))]/30">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => router.back()}
          variant="secondary"
          className="mb-4 font-semibold text-white bg-[hsl(var(--paprika))] border-none hover:bg-[hsl(var(--primary))]/90 transition-colors duration-200"
        >
          ← Back
        </Button>

        <Card className="shadow-2xl border-2 border-[hsl(var(--paprika))]/60 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold text-primary">
                  {recipe.name}
                </CardTitle>
              </div>
              {user && (
                <Button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className={`w-full md:w-auto font-semibold border-2 shadow-md hover:shadow-lg transition-all ${
                    hasFeedback
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-700"
                      : "bg-[hsl(var(--paprika))] text-white border-[hsl(var(--paprika))] hover:bg-[hsl(var(--primary))]/90 transition-colors duration-200"
                  }`}
                  size="lg"
                >
                  {hasFeedback && "✓ "}
                  {showFeedbackForm
                    ? "Hide Feedback Form"
                    : hasFeedback
                    ? "Update Feedback"
                    : "Give Feedback on This Recipe"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
              />
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-primary">Cuisine:</span>
                <p className="text-muted-foreground">{recipe.cuisine}</p>
              </div>
              <div>
                <span className="font-semibold text-primary">Difficulty:</span>
                <p className="text-muted-foreground capitalize">
                  {recipe.difficulty}
                </p>
              </div>
              {tags && tags.length > 0 && (
                <div className="col-span-2 md:col-span-1">
                  <span className="font-semibold text-primary">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[hsl(var(--sage))]/20 text-primary px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {ingredients.map((ingredient: any, idx) => {
                  const ingredientText =
                    typeof ingredient === "string"
                      ? ingredient
                      : `${ingredient.measure || ""} ${
                          ingredient.name || ""
                        }`.trim();
                  return (
                    <li
                      key={idx}
                      className="flex items-start text-muted-foreground"
                    >
                      <span className="text-[hsl(var(--paprika))] mr-2">•</span>
                      {ingredientText}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Instructions
              </h3>
              <ol className="space-y-3 list-none counter-reset">
                {recipe.instructions
                  .split("\n")
                  .filter((step) => step.trim())
                  .map((step, idx) => {
                    // Remove existing numbering patterns like "1.", "Step 1:", etc.
                    const cleanedStep = step
                      .replace(/^(\d+\.?\s*|\bStep\s+\d+:?\s*)/i, "")
                      .trim();
                    return (
                      <li
                        key={idx}
                        className="flex items-start text-muted-foreground"
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--paprika))]/20 text-primary font-semibold text-sm mr-3 mt-0.5 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">
                          {cleanedStep}
                        </span>
                      </li>
                    );
                  })}
              </ol>
            </div>
          </CardContent>
        </Card>

        {user && (
          <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0">
              <RecipeFeedbackForm
                recipeId={recipe.id}
                weekNumber={weekNumber}
                existingFeedback={existingFeedback}
                onFeedbackSubmitted={async () => {
                  setShowFeedbackForm(false);
                  // Refresh feedback after submission
                  const feedback = await api.getRecipeProgress(
                    user.id,
                    recipe.id,
                    weekNumber
                  );
                  if (feedback) {
                    setExistingFeedback(feedback);
                    setHasFeedback(feedback.status === "completed");
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
