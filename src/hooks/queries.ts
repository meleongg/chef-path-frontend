"use client";

import { api } from "@/lib/api";
import { UserRecipeProgress } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * TanStack Query hooks for server data fetching
 * Provides automatic caching, request deduplication, and background refetching
 */

// Query Keys - centralized for consistency
export const queryKeys = {
  weeklyPlans: (userId: string) => ["weeklyPlans", userId] as const,
  weeklyPlan: (userId: string, weekNumber: number) =>
    ["weeklyPlan", userId, weekNumber] as const,
  recipeProgress: (userId: string, weekNumber: number) =>
    ["recipeProgress", userId, weekNumber] as const,
  recipe: (recipeId: string) => ["recipe", recipeId] as const,
  userProgress: (userId: string) => ["userProgress", userId] as const,
};

/**
 * Fetch all weekly plans for a user
 * Cached for 5 minutes, automatically deduplicates requests
 */
export function useWeeklyPlansQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weeklyPlans(userId!),
    queryFn: () => api.getAllWeeklyPlans(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a specific week's plan
 */
export function useWeeklyPlanQuery(
  userId: string | undefined,
  weekNumber: number,
) {
  return useQuery({
    queryKey: queryKeys.weeklyPlan(userId!, weekNumber),
    queryFn: () => api.getWeeklyPlan(userId!, weekNumber),
    enabled: !!userId && weekNumber > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch recipe progress for a specific week
 * Updated more frequently (1 minute) as users actively work on recipes
 */
export function useWeeklyRecipeProgressQuery(
  userId: string | undefined,
  weekNumber: number,
) {
  return useQuery({
    queryKey: queryKeys.recipeProgress(userId!, weekNumber),
    queryFn: () => api.getWeeklyRecipeProgress(userId!, weekNumber),
    enabled: !!userId && weekNumber > 0,
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates
  });
}

/**
 * Fetch a single recipe by ID
 * Cached for 10 minutes as recipes don't change often
 */
export function useRecipeQuery(recipeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recipe(recipeId!),
    queryFn: () => api.getRecipe(recipeId!),
    enabled: !!recipeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch overall user progress
 */
export function useUserProgressQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userProgress(userId!),
    queryFn: () => api.getUserProgress(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Mutation: Update recipe progress
 * Automatically invalidates related queries on success
 * Note: This is a placeholder - implement actual update API call when backend supports it
 */
export function useUpdateRecipeProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      recipeId,
      weekNumber,
      progress,
    }: {
      userId: string;
      recipeId: string;
      weekNumber: number;
      progress: Partial<UserRecipeProgress>;
    }) => {
      // TODO: Replace with actual update API call when available
      // For now, just return the progress data
      return Promise.resolve(progress);
    },
    onSuccess: (_, variables) => {
      // Invalidate recipe progress for this week
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipeProgress(
          variables.userId,
          variables.weekNumber,
        ),
      });
      // Also invalidate overall user progress
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgress(variables.userId),
      });
    },
  });
}

/**
 * Mutation: Complete a week and unlock the next
 * Invalidates weekly plans to show the newly unlocked week
 */
export function useCompleteWeekMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      weekNumber,
    }: {
      userId: string;
      weekNumber: number;
    }) => api.checkNextWeekEligibility(userId),
    onSuccess: (_, variables) => {
      // Invalidate weekly plans to reflect the completion
      queryClient.invalidateQueries({
        queryKey: queryKeys.weeklyPlans(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProgress(variables.userId),
      });
    },
  });
}

/**
 * Mutation: Submit recipe feedback
 * Optionally invalidates recipe progress if feedback affects it
 */
export function useSubmitFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackData: any) => api.submitFeedback(feedbackData),
    onSuccess: (_, variables: any) => {
      // Invalidate recipe progress to show feedback was submitted
      if (variables.user_id && variables.week_number) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recipeProgress(
            variables.user_id,
            variables.week_number,
          ),
        });
      }
    },
  });
}
