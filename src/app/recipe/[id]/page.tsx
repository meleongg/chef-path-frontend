"use client";

import RecipeFeedbackForm from "@/components/RecipeFeedbackForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRecipes } from "@/hooks";
import type { ParsedRecipe } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getRecipe, isLoading, error } = useRecipes();
  const [recipe, setRecipe] = useState<ParsedRecipe | null>(null);

  useEffect(() => {
    if (id) {
      getRecipe(Number(id)).then((data) => setRecipe(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            <img
              src={recipe.image_url}
              alt={recipe.name}
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
              {Array.isArray(recipe.ingredients)
                ? recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                : null}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Instructions:</div>
            <div className="whitespace-pre-line text-sm">
              {recipe.instructions}
            </div>
          </div>
          {/* Mark as Complete Button & Feedback Modal */}
          <div className="flex justify-center mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-[hsl(var(--sage))] text-primary px-6 py-2 rounded font-semibold border border-[hsl(var(--paprika))] shadow transition-colors duration-200 hover:bg-[hsl(var(--sage))]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
                  variant="default"
                  size="default"
                >
                  Mark as Complete
                </Button>
              </DialogTrigger>
              <DialogContent className="p-0 max-w-lg bg-white">
                <RecipeFeedbackForm recipeId={recipe.id} weekNumber={1} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
