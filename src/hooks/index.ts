"use client";

import { actions, useApp } from "@/contexts/AppContext";
import { api, parseHelpers } from "@/lib/api";
import {
  ParsedRecipe,
  Recipe,
  SubmitFeedbackRequest,
  User,
  UserProfileRequest,
  UserProgress,
  UserRecipeProgress,
  WeeklyPlan,
} from "@/types";
import { useState } from "react";

// Hook for managing user data
export function useUser() {
  const { state, dispatch } = useApp();

  const updateUserProfile = async (
    userData: UserProfileRequest
  ): Promise<User | null> => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const user = await api.updateUserProfile(userData);
      dispatch(actions.setUser(user));

      // Store user ID in localStorage for persistence
      localStorage.setItem("chefpath_user_id", user.id.toString());

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update user profile";
      dispatch(actions.setError(errorMessage));
      return null;
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  const loadUser = async (userId: string): Promise<User | null> => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const user = await api.getUser(userId);
      dispatch(actions.setUser(user));

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user";
      dispatch(actions.setError(errorMessage));
      return null;
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  // Try to load user from localStorage on app start
  const initializeUser = async (): Promise<void> => {
    const storedUserId = localStorage.getItem("chefpath_user_id");
    if (storedUserId) {
      await loadUser(storedUserId);
    }
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    updateUserProfile,
    loadUser,
    initializeUser,
  };
}

// Hook for managing weekly plans
export function useWeeklyPlans() {
  const { state, dispatch } = useApp();

  const loadWeeklyPlans = async (userId: string): Promise<WeeklyPlan[]> => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const plans = await api.getAllWeeklyPlans(userId);
      dispatch(actions.setWeeklyPlans(plans));

      // Set current week based on user progress
      const unlockedPlans = plans.filter((plan) => plan.is_unlocked);
      if (unlockedPlans.length > 0) {
        const currentWeek = Math.max(
          ...unlockedPlans.map((plan) => plan.week_number)
        );
        dispatch(actions.setCurrentWeek(currentWeek));
      }

      return plans;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load weekly plans";
      dispatch(actions.setError(errorMessage));
      return [];
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  const getCurrentWeekPlan = (): WeeklyPlan | null => {
    return (
      state.weeklyPlans.find(
        (plan) => plan.week_number === state.currentWeek
      ) || null
    );
  };

  const getWeekPlan = (weekNumber: number): WeeklyPlan | null => {
    return (
      state.weeklyPlans.find((plan) => plan.week_number === weekNumber) || null
    );
  };

  return {
    weeklyPlans: state.weeklyPlans,
    currentWeek: state.currentWeek,
    isLoading: state.isLoading,
    error: state.error,
    loadWeeklyPlans,
    getCurrentWeekPlan,
    getWeekPlan,
  };
}

// Hook for managing recipes with context caching
export function useRecipes() {
  const { state, dispatch } = useApp();

  const getRecipe = async (recipeId: string): Promise<Recipe | null> => {
    // Check context cache first
    if (state.recipes[recipeId]) {
      return state.recipes[recipeId];
    }

    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const recipe = await api.getRecipe(recipeId);
      dispatch(actions.setRecipe(recipe));

      return recipe;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load recipe";
      dispatch(actions.setError(errorMessage));
      return null;
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  const getRecipeFromCache = (recipeId: string): Recipe | null => {
    return state.recipes[recipeId] || null;
  };

  const getParsedRecipe = (recipe: Recipe): ParsedRecipe => {
    return {
      ...recipe,
      ingredients: parseHelpers.parseRecipeIngredients(recipe.ingredients),
      tags: parseHelpers.parseRecipeTags(recipe.tags || "[]"),
    };
  };

  return {
    isLoading: state.isLoading,
    error: state.error,
    getRecipe,
    getRecipeFromCache,
    getParsedRecipe,
  };
}

// Hook for managing weekly recipe progress
export function useWeeklyRecipeProgress() {
  const { state, dispatch } = useApp();

  const loadWeeklyRecipeProgress = async (
    userId: string,
    weekNumber: number
  ): Promise<void> => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      // Get current week's plan to find recipe IDs
      const weekPlan = state.weeklyPlans.find(
        (plan) => plan.week_number === weekNumber
      );

      if (!weekPlan) {
        dispatch(actions.setLoading(false));
        return;
      }

      // Batch fetch all recipe progress
      const progressPromises = weekPlan.recipes.map((recipe) =>
        api.getRecipeProgress(userId, recipe.id, weekNumber)
      );

      const progressResults = await Promise.all(progressPromises);

      // Filter nulls and store in context
      const validProgress = progressResults.filter(
        (p) => p !== null
      ) as UserRecipeProgress[];

      dispatch(actions.setWeeklyRecipeProgress(validProgress));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load recipe progress";
      dispatch(actions.setError(errorMessage));
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  const getRecipeProgress = (
    recipeId: string,
    weekNumber: number
  ): UserRecipeProgress | null => {
    return (
      state.weeklyRecipeProgress.find(
        (p) => p.recipe_id === recipeId && p.week_number === weekNumber
      ) || null
    );
  };

  const isRecipeCompleted = (recipeId: string, weekNumber: number): boolean => {
    const progress = getRecipeProgress(recipeId, weekNumber);
    return progress?.status === "completed";
  };

  return {
    weeklyRecipeProgress: state.weeklyRecipeProgress,
    isLoading: state.isLoading,
    error: state.error,
    loadWeeklyRecipeProgress,
    getRecipeProgress,
    isRecipeCompleted,
  };
}

// Hook for managing feedback and progress
export function useFeedback() {
  const { state, dispatch } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (
    feedbackData: SubmitFeedbackRequest
  ): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      dispatch(actions.setError(null));

      const response = await api.submitFeedback(feedbackData);

      // Reload recipe progress to get updated status
      const updatedProgress = await api.getRecipeProgress(
        feedbackData.user_id,
        feedbackData.recipe_id,
        feedbackData.week_number
      );

      if (updatedProgress) {
        dispatch(actions.updateRecipeProgress(updatedProgress));
      }

      // If next week was unlocked, refresh weekly plans
      if (response.next_week_unlocked && state.user) {
        const plans = await api.getAllWeeklyPlans(state.user.id);
        dispatch(actions.setWeeklyPlans(plans));

        // Update current week if needed
        const unlockedPlans = plans.filter((plan) => plan.is_unlocked);
        if (unlockedPlans.length > 0) {
          const newCurrentWeek = Math.max(
            ...unlockedPlans.map((plan) => plan.week_number)
          );
          if (newCurrentWeek > state.currentWeek) {
            dispatch(actions.setCurrentWeek(newCurrentWeek));
          }
        }
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit feedback";
      dispatch(actions.setError(errorMessage));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadUserProgress = async (
    userId: string
  ): Promise<UserProgress | null> => {
    try {
      dispatch(actions.setLoading(true));
      dispatch(actions.setError(null));

      const progress = await api.getUserProgress(userId);
      dispatch(actions.setUserProgress(progress));

      return progress;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user progress";
      dispatch(actions.setError(errorMessage));
      return null;
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  return {
    userProgress: state.userProgress,
    isSubmitting,
    error: state.error,
    submitFeedback,
    loadUserProgress,
  };
}

// Hook for form validation
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateOnboarding = (data: UserProfileRequest): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.cuisine) {
      newErrors.cuisine = "Please select a cuisine";
    }

    if (data.frequency < 1 || data.frequency > 7) {
      newErrors.frequency = "Frequency must be between 1 and 7 meals per week";
    }

    if (!data.skill_level) {
      newErrors.skill_level = "Please select your skill level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateOnboarding,
    clearErrors,
  };
}
