"use client";

import { useApp } from "@/contexts/AppContext";
import { resolveRecipeWeek } from "@/lib/recipeWeek";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Legacy route: redirect to canonical recipe overview. */
export default function LegacyRecipeRedirectPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useApp();
  const recipeId = typeof id === "string" ? id : id?.[0];

  useEffect(() => {
    if (!recipeId) return;
    const week = resolveRecipeWeek(searchParams, state.currentWeek);
    router.replace(`/recipe/${recipeId}?week=${week}`);
  }, [recipeId, searchParams, state.currentWeek, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(var(--paprika))]" />
    </div>
  );
}
