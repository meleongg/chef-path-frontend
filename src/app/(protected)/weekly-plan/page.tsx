"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { useUser, useWeeklyPlans, useWeeklyRecipeProgress } from "@/hooks";
import { api } from "@/lib/api";
import { NextWeekEligibility, WeeklyPlanResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WeeklyPlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlanResponse | null>(
    null
  );
  const [nextWeekEligibility, setNextWeekEligibility] =
    useState<NextWeekEligibility | null>(null);
  const { user, isLoading: userLoading } = useUser();
  const {
    weeklyPlans,
    currentWeek,
    isLoading: plansLoading,
    error,
    loadWeeklyPlans,
    getCurrentWeekPlan,
  } = useWeeklyPlans();
  const { isRecipeCompleted, loadWeeklyRecipeProgress } =
    useWeeklyRecipeProgress();
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

  // Check eligibility when recipe progress changes
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user) return;
      try {
        const eligibility = await api.checkNextWeekEligibility(user.id);
        setNextWeekEligibility(eligibility);
      } catch (err) {
        console.error("Failed to check next week eligibility:", err);
      }
    };

    checkEligibility();
  }, [user, currentPlan]);

  const handleGenerateNextWeek = async () => {
    if (!user || !nextWeekEligibility?.can_generate) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const plan = await api.generateNextWeekPlan(user.id);
      setGeneratedPlan(plan);
      await loadWeeklyPlans(user.id);
      // Load progress for the new week
      await loadWeeklyRecipeProgress(user.id, plan.week_number);
    } catch (err: any) {
      setGenerateError(
        err?.message || "Failed to generate next week plan. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInitialWeek = async () => {
    if (!user) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const initialIntent = `Create a weekly meal plan for week ${nextWeek} for a user who prefers ${user.cuisine} cuisine, wants ${user.frequency} meals per week, is a ${user.skill_level} cook, and whose goal is ${user.user_goal}.`;
      const plan = await api.generateWeeklyPlan(user.id, initialIntent);
      setGeneratedPlan(plan);
      // Load progress for the new week
      await loadWeeklyRecipeProgress(user.id, plan.week_number);

      // Dispatch event to notify FloatingChat to show pulse animation
      window.dispatchEvent(new CustomEvent("firstPlanGenerated"));
    } catch (err: any) {
      setGenerateError(
        err?.message || "Failed to generate weekly plan. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/20 via-amber-50 to-[hsl(var(--turmeric))]/20">
      <Card className="w-full max-w-3xl shadow-2xl border-2 border-[hsl(var(--paprika))]/60 bg-white/95 backdrop-blur-sm">
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
                const completedCount = currentPlan.recipes.filter((recipe) =>
                  isRecipeCompleted(recipe.id, currentPlan.week_number)
                ).length;
                const totalCount = currentPlan.recipes.length;
                const progressPercentage =
                  totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                  <>
                    {/* Week Completion Banner */}
                    {nextWeekEligibility?.can_generate && (
                      <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-green-500 rounded-xl shadow-lg">
                        <div className="text-center space-y-4">
                          <div className="text-2xl">🎉</div>
                          <div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">
                              Congratulations! Week {currentPlan.week_number}{" "}
                              Complete!
                            </h3>
                            <p className="text-green-700 mb-4">
                              You've finished all recipes this week. Ready to
                              continue your culinary journey?
                            </p>
                          </div>
                          <button
                            onClick={handleGenerateNextWeek}
                            disabled={isGenerating}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 transition-all transform hover:scale-105"
                          >
                            {isGenerating ? (
                              <span className="flex items-center justify-center">
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                Generating Week {nextWeekEligibility.next_week}
                                ...
                              </span>
                            ) : (
                              `Generate Week ${nextWeekEligibility.next_week} Plan`
                            )}
                          </button>
                          <p className="text-sm text-green-600">
                            Use the chat widget to modify your plan if needed
                          </p>
                        </div>
                      </div>
                    )}

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
                    <Card className="overflow-hidden group-hover:shadow-2xl group-hover:border-[hsl(var(--paprika))]/60 transition-all duration-300 h-full flex flex-col relative border-2 border-gray-200">
                      {/* Completion Badge */}
                      {isRecipeCompleted(
                        recipe.id,
                        currentPlan.week_number
                      ) && (
                        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                          <span>✓</span>
                          <span>Completed</span>
                        </div>
                      )}

                      {recipe.image_url ? (
                        <div className="w-full h-48 overflow-hidden flex-shrink-0 relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:from-black/30 transition-all" />
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 flex-shrink-0 bg-gradient-to-br from-amber-100/80 via-orange-100/80 to-[hsl(var(--turmeric))]/40 flex items-center justify-center group-hover:from-amber-200/80 group-hover:via-orange-200/80 transition-all duration-300">
                          <div className="text-center px-4">
                            <span className="text-5xl mb-2 block group-hover:scale-110 transition-transform">
                              🍽️
                            </span>
                            <p className="text-sm font-semibold text-[hsl(var(--paprika))]">
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
              <div className="mb-6">
                <p className="text-lg text-muted-foreground mb-2">
                  {nextWeekEligibility?.message ||
                    "You don't have a weekly meal plan yet."}
                </p>
              </div>
              <button
                className="px-8 py-4 bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-[hsl(var(--paprika))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))] disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                onClick={
                  nextWeekEligibility?.current_week === null
                    ? handleGenerateInitialWeek
                    : handleGenerateNextWeek
                }
                disabled={
                  isGenerating ||
                  (nextWeekEligibility?.current_week !== null &&
                    !nextWeekEligibility?.can_generate)
                }
                aria-label={
                  nextWeekEligibility?.current_week === null
                    ? `Generate Week ${nextWeek} Plan`
                    : `Generate Week ${nextWeekEligibility?.next_week} Plan`
                }
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    Generating...
                  </span>
                ) : nextWeekEligibility?.current_week === null ? (
                  `🚀 Generate Week ${nextWeek} Plan`
                ) : (
                  `Generate Week ${nextWeekEligibility?.next_week} Plan`
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
