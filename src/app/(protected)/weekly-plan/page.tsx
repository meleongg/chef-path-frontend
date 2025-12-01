"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { useUser, useWeeklyPlans } from "@/hooks";
import { api } from "@/lib/api";
import { WeeklyPlanResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WeeklyPlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlanResponse | null>(
    null
  );
  const [recipeProgress, setRecipeProgress] = useState<Record<string, boolean>>(
    {}
  );
  const { user, isLoading: userLoading } = useUser();
  const {
    weeklyPlans,
    currentWeek,
    isLoading: plansLoading,
    error,
    loadWeeklyPlans,
    getCurrentWeekPlan,
  } = useWeeklyPlans();
  const router = useRouter();

  const currentPlan = generatedPlan || getCurrentWeekPlan();
  const nextWeek =
    weeklyPlans && weeklyPlans.length > 0
      ? Math.max(...weeklyPlans.map((plan) => plan.week_number)) + 1
      : 1;

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/onboarding");
      return;
    }
    if (user) {
      loadWeeklyPlans(user.id);
    }
  }, [user, userLoading]);

  useEffect(() => {
    const loadRecipeProgress = async () => {
      if (!user || !currentPlan) return;

      const progressMap: Record<string, boolean> = {};

      await Promise.all(
        currentPlan.recipes.map(async (recipe) => {
          const progress = await api.getRecipeProgress(
            user.id,
            recipe.id,
            currentPlan.week_number
          );
          // Only count as complete if status is "completed"
          progressMap[recipe.id] = progress?.status === "completed";
        })
      );

      setRecipeProgress(progressMap);
    };

    loadRecipeProgress();
  }, [user, currentPlan]);

  // Listen for plan updates from chat
  useEffect(() => {
    const handlePlanUpdate = (event: CustomEvent) => {
      const updatedPlan = event.detail.plan;
      setGeneratedPlan(updatedPlan);
      // Reload plans to ensure everything is in sync
      if (user) {
        loadWeeklyPlans(user.id);
      }
    };

    window.addEventListener(
      "weeklyPlanUpdated",
      handlePlanUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "weeklyPlanUpdated",
        handlePlanUpdate as EventListener
      );
    };
  }, [user]);

  if (userLoading || plansLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your weekly plan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10">
      <Card className="w-full max-w-3xl shadow-cozy border-2 border-[hsl(var(--paprika))]/50 bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Your Weekly Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-center mb-4">{error}</div>
          )}
          {generateError && (
            <div className="text-red-600 text-center mb-4">{generateError}</div>
          )}
          {currentPlan ? (
            <div className="py-4">
              {(() => {
                const completedCount =
                  Object.values(recipeProgress).filter(Boolean).length;
                const totalCount = currentPlan.recipes.length;
                const progressPercentage =
                  totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                  <>
                    <div className="mb-6 space-y-3">
                      <div className="text-center text-lg font-semibold text-primary">
                        Week {currentPlan.week_number}: {totalCount} recipes
                        planned
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {completedCount} of {totalCount} completed
                          </span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
              <div className="grid gap-6 md:grid-cols-2">
                {currentPlan.recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipe/${recipe.id}?week=${currentPlan.week_number}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden group-hover:shadow-lg transition-shadow h-full flex flex-col relative">
                      {/* Completion Badge */}
                      {recipeProgress[recipe.id] && (
                        <div className="absolute top-3 right-3 z-10 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                          <span>✓</span>
                          <span>Completed</span>
                        </div>
                      )}

                      {recipe.image_url ? (
                        <div className="w-full h-48 overflow-hidden flex-shrink-0">
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 flex-shrink-0 bg-gradient-to-br from-[hsl(var(--paprika))]/20 via-[hsl(var(--sage))]/20 to-[hsl(var(--turmeric))]/20 flex items-center justify-center">
                          <div className="text-center px-4">
                            <span className="text-4xl mb-2 block">🍽️</span>
                            <p className="text-sm font-medium text-muted-foreground">
                              {recipe.cuisine}
                            </p>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="font-bold text-lg text-primary mb-1 group-hover:underline line-clamp-2">
                          {recipe.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {recipe.cuisine}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6 text-lg text-muted-foreground">
                You don’t have a weekly meal plan yet.
                <br />
                Click below to generate your personalized plan and get started!
              </div>
              <button
                className="px-6 py-3 bg-[hsl(var(--paprika))] text-[hsl(var(--sage))] font-semibold rounded shadow border border-[hsl(var(--sage))] hover:bg-[hsl(var(--paprika))]/90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sage))] disabled:opacity-60"
                onClick={async () => {
                  setIsGenerating(true);
                  setGenerateError("");
                  try {
                    const initialIntent = `Create a weekly meal plan for week ${nextWeek} for a user who prefers ${user.cuisine} cuisine, wants ${user.frequency} meals per week, is a ${user.skill_level} cook, and whose goal is ${user.user_goal}.`;
                    const plan = await api.generateWeeklyPlan(
                      user.id,
                      initialIntent
                    );
                    setGeneratedPlan(plan);
                  } catch (err: any) {
                    setGenerateError(
                      err?.message ||
                        "Failed to generate weekly plan. Please try again."
                    );
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                disabled={isGenerating}
                aria-label={`Generate Week ${nextWeek} Plan`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></span>
                    Generating...
                  </span>
                ) : (
                  `Generate Week ${nextWeek} Plan`
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
