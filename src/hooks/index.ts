"use client";

import { actions, useApp } from "@/contexts/AppContext";
import { api, parseHelpers } from "@/lib/api";
import {
  UserProfileRequest,
  ParsedRecipe,
  SubmitFeedbackRequest,
  User,
  UserProgress,
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
        error instanceof Error ? error.message : "Failed to update user profile";
      dispatch(actions.setError(errorMessage));
      return null;
    } finally {
      dispatch(actions.setLoading(false));
    }
  };

  const loadUser = async (userId: number): Promise<User | null> => {
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
      await loadUser(parseInt(storedUserId, 10));
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

  const loadWeeklyPlans = async (userId: number): Promise<WeeklyPlan[]> => {
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

// Hook for managing recipes
export function useRecipes() {
  const [recipeCache, setRecipeCache] = useState<Map<number, ParsedRecipe>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecipe = async (recipeId: number): Promise<ParsedRecipe | null> => {
    // Check cache first
    if (recipeCache.has(recipeId)) {
      return recipeCache.get(recipeId)!;
    }

    try {
      setIsLoading(true);
      setError(null);

      const recipe = await api.getRecipe(recipeId);

      // Parse JSON fields
      const parsedRecipe: ParsedRecipe = {
        ...recipe,
        ingredients: parseHelpers.parseRecipeIngredients(recipe.ingredients),
        tags: parseHelpers.parseRecipeTags(recipe.tags),
      };

      // Update cache
      setRecipeCache((prev) => new Map(prev).set(recipeId, parsedRecipe));

      return parsedRecipe;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load recipe";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipeFromCache = (recipeId: number): ParsedRecipe | null => {
    return recipeCache.get(recipeId) || null;
  };

  return {
    isLoading,
    error,
    getRecipe,
    getRecipeFromCache,
    recipeCache: Array.from(recipeCache.values()),
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
    userId: number
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
