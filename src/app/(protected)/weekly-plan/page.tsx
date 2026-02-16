"use client";

import SwapRecipeModal from "@/components/SwapRecipeModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { useApp } from "@/contexts/AppContext";
import { useUser } from "@/hooks";
import {
  queryKeys,
  useNextWeekEligibilityQuery,
  useSwapRecipeMutation,
  useToggleRecipeStatusMutation,
  useWeeklyPlansQuery,
  useWeeklyRecipeProgressQuery,
} from "@/hooks/queries";
import { api } from "@/lib/api";
import { WeeklyPlanResponse } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  Check,
  PartyPopper,
  RotateCcw,
  Rocket,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WeeklyPlanPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlanResponse | null>(
    null
  );
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [swapError, setSwapError] = useState("");
  const [toggleError, setToggleError] = useState("");

  const { user, isLoading: userLoading } = useUser();
  const { state } = useApp();
  const currentWeek = state.currentWeek;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutations for swapping recipes and toggling status
  const swapMutation = useSwapRecipeMutation();
  const toggleStatusMutation = useToggleRecipeStatusMutation();

  // TanStack Query hooks - automatically cached from layout
  const {
    data: weeklyPlans,
    isLoading: plansLoading,
    error,
  } = useWeeklyPlansQuery(user?.id);
  const { data: recipeProgress } = useWeeklyRecipeProgressQuery(
    user?.id,
    currentWeek
  );
  const { data: nextWeekEligibility, isLoading: eligibilityLoading } =
    useNextWeekEligibilityQuery(user?.id);

  // Helper to check if recipe is completed
  const isRecipeCompleted = (recipeId: string, weekNumber: number): boolean => {
    if (!recipeProgress) return false;
    const progress = recipeProgress.find(
      (p) => p.recipe_id === recipeId && p.week_number === weekNumber
    );
    return progress?.status === "completed" || false;
  };

  const getCurrentWeekPlan = () => {
    if (!weeklyPlans) return null;
    return weeklyPlans.find((plan) => plan.week_number === currentWeek) || null;
  };

  const currentPlan = generatedPlan || getCurrentWeekPlan();
  const nextWeek =
    weeklyPlans && weeklyPlans.length > 0
      ? Math.max(...weeklyPlans.map((plan) => plan.week_number)) + 1
      : 1;

  // Determine if we're still initializing
  const isInitializing =
    !weeklyPlans ||
    (weeklyPlans.length > 0 && currentWeek === 0) ||
    (weeklyPlans.length > 0 && !currentPlan && !generatedPlan);

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/onboarding");
    }
  }, [user, userLoading, router]);

  const isLoading = userLoading || plansLoading || eligibilityLoading;

  const handleGenerateNextWeek = async () => {
    if (!user || !nextWeekEligibility?.can_generate) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const plan = await api.generateNextWeekPlan(user.id);
      setGeneratedPlan(plan);

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({
        queryKey: queryKeys.weeklyPlans(user.id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeProgress(user.id, plan.week_number),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.nextWeekEligibility(user.id),
      });
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

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({
        queryKey: queryKeys.weeklyPlans(user.id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.recipeProgress(user.id, plan.week_number),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.nextWeekEligibility(user.id),
      });

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

  const handleSwapClick = (recipe: any) => {
    setSelectedRecipe(recipe);
    setSwapError("");
    setSwapModalOpen(true);
  };

  const handleSwapConfirm = async (context: string) => {
    if (!user || !selectedRecipe || !currentPlan) return;

    try {
      const result = await swapMutation.mutateAsync({
        userId: user.id,
        request: {
          recipe_id_to_replace: selectedRecipe.id,
          week_number: currentPlan.week_number,
          swap_context: context,
        },
      });

      // Show success notification
      console.log(
        `✓ Swapped ${result.old_recipe.name} with ${result.new_recipe.name}`
      );

      // Close modal and reset state
      setSwapModalOpen(false);
      setSelectedRecipe(null);
    } catch (err: any) {
      const errorMsg =
        err?.message === "Cannot swap a completed recipe"
          ? "Cannot swap a completed recipe"
          : err?.message || "Failed to swap recipe. Please try again.";
      setSwapError(errorMsg);
    }
  };

  const handleMarkIncomplete = async (recipeId: string, weekNumber: number) => {
    if (!user) return;

    try {
      setToggleError("");
      await toggleStatusMutation.mutateAsync({
        userId: user.id,
        recipeId,
        weekNumber,
        request: { status: "not_started" },
      });

      // Show success notification
      console.log("✓ Marked recipe as incomplete");
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        "Failed to mark recipe as incomplete. Please try again.";
      setToggleError(errorMsg);
    }
  };

  // Only show full-screen loading if user is not authenticated yet
  if (userLoading || !user) {
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
            <div className="text-red-600 text-center mb-4">{String(error)}</div>
          )}
          {generateError && (
            <div className="text-red-600 text-center mb-4">{generateError}</div>
          )}

          {/* Show loading state while data is being fetched */}
          {isLoading || isInitializing ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading your weekly plan...
              </p>
            </div>
          ) : currentPlan ? (
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
                          <div className="flex justify-center">
                            <PartyPopper className="w-12 h-12 text-green-600" />
                          </div>
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
                          <Check className="w-3 h-3" />
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
                            <UtensilsCrossed className="w-16 h-16 mx-auto mb-2 text-[hsl(var(--paprika))] group-hover:scale-110 transition-transform" />
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
                        <div className="text-sm text-muted-foreground mb-4">
                          {recipe.cuisine}
                        </div>

                        {/* Swap Button */}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const isCompleted = isRecipeCompleted(
                                recipe.id,
                                currentPlan.week_number
                              );
                              if (!isCompleted) {
                                handleSwapClick(recipe);
                              }
                            }}
                            disabled={isRecipeCompleted(
                              recipe.id,
                              currentPlan.week_number
                            )}
                            title={
                              isRecipeCompleted(
                                recipe.id,
                                currentPlan.week_number
                              )
                                ? "Cannot swap completed recipes"
                                : "Swap this recipe"
                            }
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-[hsl(var(--paprika))] hover:bg-amber-100/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                            Swap
                          </button>

                          {/* Mark as Incomplete Button */}
                          {isRecipeCompleted(
                            recipe.id,
                            currentPlan.week_number
                          ) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMarkIncomplete(
                                  recipe.id,
                                  currentPlan.week_number
                                );
                              }}
                              disabled={toggleStatusMutation.isPending}
                              title="Mark this recipe as incomplete"
                              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <RotateCcw className="w-4 h-4" />
                              {toggleStatusMutation.isPending
                                ? "Marking..."
                                : "Mark Incomplete"}
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Only show "no plan" UI when we know for sure there are no plans */
            weeklyPlans &&
            weeklyPlans.length === 0 && (
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
                    <span className="flex items-center justify-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Generate Week {nextWeek} Plan
                    </span>
                  ) : (
                    `Generate Week ${nextWeekEligibility?.next_week} Plan`
                  )}
                </button>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Swap Recipe Modal */}
      <SwapRecipeModal
        isOpen={swapModalOpen}
        recipeId={selectedRecipe?.id ?? ""}
        recipeName={selectedRecipe?.name ?? ""}
        weekNumber={currentPlan?.week_number ?? 0}
        onClose={() => {
          setSwapModalOpen(false);
          setSwapError("");
        }}
        onConfirm={handleSwapConfirm}
        isLoading={swapMutation.isPending}
      />

      {/* Swap Error Toast */}
      {swapError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="font-medium">{swapError}</p>
          <button
            onClick={() => setSwapError("")}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toggle Status Error Toast */}
      {toggleError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="font-medium">{toggleError}</p>
          <button
            onClick={() => setToggleError("")}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
