"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        </CardContent>
      </Card>
    </div>
  );
}
