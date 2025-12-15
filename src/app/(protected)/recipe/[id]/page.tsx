"use client";

import RecipeFeedbackForm from "@/components/RecipeFeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRecipes, useUser, useWeeklyRecipeProgress } from "@/hooks";
import { parseHelpers } from "@/lib/api";
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
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { user } = useUser();
  const { getRecipe, getRecipeFromCache } = useRecipes();
  const { getRecipeProgress, isRecipeCompleted } = useWeeklyRecipeProgress();
  const router = useRouter();

  // Get recipe from cache or load it
  const recipe = getRecipeFromCache(resolvedParams.id);
  const existingFeedback = getRecipeProgress(resolvedParams.id, weekNumber);
  const hasFeedback = isRecipeCompleted(resolvedParams.id, weekNumber);

  useEffect(() => {
    // Only fetch if not in cache
    if (!recipe && resolvedParams.id) {
      getRecipe(resolvedParams.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id, recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  const ingredients = parseHelpers.parseRecipeIngredients(recipe.ingredients);
  const instructions = parseHelpers.parseRecipeInstructions(
    recipe.instructions
  );
  const dietaryTags = recipe.dietary_tags
    ? parseHelpers.parseRecipeTags(recipe.dietary_tags)
    : [];
  const allergens = recipe.allergens
    ? parseHelpers.parseRecipeTags(recipe.allergens)
    : [];

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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              {recipe.prep_time_minutes && (
                <div>
                  <span className="font-semibold text-primary">Prep Time:</span>
                  <p className="text-muted-foreground">
                    {recipe.prep_time_minutes} min
                  </p>
                </div>
              )}
              {recipe.cook_time_minutes && (
                <div>
                  <span className="font-semibold text-primary">Cook Time:</span>
                  <p className="text-muted-foreground">
                    {recipe.cook_time_minutes} min
                  </p>
                </div>
              )}
              {recipe.portion_size && (
                <div>
                  <span className="font-semibold text-primary">Serves:</span>
                  <p className="text-muted-foreground">{recipe.portion_size}</p>
                </div>
              )}
            </div>

            {(dietaryTags.length > 0 || allergens.length > 0) && (
              <div className="space-y-3">
                {dietaryTags.length > 0 && (
                  <div>
                    <span className="font-semibold text-primary text-sm">
                      Dietary:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dietaryTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {allergens.length > 0 && (
                  <div>
                    <span className="font-semibold text-primary text-sm">
                      Allergens:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium"
                        >
                          ⚠️ {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              <ol className="space-y-3 list-none">
                {instructions.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-muted-foreground"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--paprika))]/20 text-primary font-semibold text-sm mr-3 mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">
                      {typeof step === "string" ? step : step.text}
                    </span>
                  </li>
                ))}
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
                onFeedbackSubmitted={() => {
                  setShowFeedbackForm(false);
                  // Progress is now automatically updated via useFeedback hook
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
