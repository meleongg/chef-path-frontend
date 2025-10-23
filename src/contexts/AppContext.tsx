"use client";

import { User, UserProgress, UserRecipeProgress, WeeklyPlan } from "@/types";
import React, { createContext, ReactNode, useContext, useReducer } from "react";

// App State Interface
interface AppState {
  user: User | null;
  currentWeek: number;
  weeklyPlans: WeeklyPlan[];
  userProgress: UserProgress | null;
  weeklyRecipeProgress: UserRecipeProgress[];
  isLoading: boolean;
  error: string | null;
}

// Action Types
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_CURRENT_WEEK"; payload: number }
  | { type: "SET_WEEKLY_PLANS"; payload: WeeklyPlan[] }
  | { type: "SET_USER_PROGRESS"; payload: UserProgress | null }
  | { type: "SET_WEEKLY_RECIPE_PROGRESS"; payload: UserRecipeProgress[] }
  | { type: "UPDATE_WEEKLY_PLAN"; payload: WeeklyPlan }
  | { type: "RESET_STATE" };

// Initial State
const initialState: AppState = {
  user: null,
  currentWeek: 1,
  weeklyPlans: [],
  userProgress: null,
  weeklyRecipeProgress: [],
  isLoading: false,
  error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_CURRENT_WEEK":
      return { ...state, currentWeek: action.payload };

    case "SET_WEEKLY_PLANS":
      return { ...state, weeklyPlans: action.payload };

    case "SET_USER_PROGRESS":
      return { ...state, userProgress: action.payload };

    case "UPDATE_WEEKLY_PLAN":
      return {
        ...state,
        weeklyPlans: state.weeklyPlans.map((plan) =>
          plan.id === action.payload.id ? action.payload : plan
        ),
      };
    case "SET_WEEKLY_RECIPE_PROGRESS":
      return {
        ...state,
        weeklyRecipeProgress: action.payload,
      };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Action Creators (for better TypeScript support)
export const actions = {
  setWeeklyRecipeProgress: (progress: UserRecipeProgress[]): AppAction => ({
    type: "SET_WEEKLY_RECIPE_PROGRESS",
    payload: progress,
  }),
  setLoading: (isLoading: boolean): AppAction => ({
    type: "SET_LOADING",
    payload: isLoading,
  }),

  setError: (error: string | null): AppAction => ({
    type: "SET_ERROR",
    payload: error,
  }),

  setUser: (user: User | null): AppAction => ({
    type: "SET_USER",
    payload: user,
  }),

  setCurrentWeek: (week: number): AppAction => ({
    type: "SET_CURRENT_WEEK",
    payload: week,
  }),

  setWeeklyPlans: (plans: WeeklyPlan[]): AppAction => ({
    type: "SET_WEEKLY_PLANS",
    payload: plans,
  }),

  setUserProgress: (progress: UserProgress | null): AppAction => ({
    type: "SET_USER_PROGRESS",
    payload: progress,
  }),

  updateWeeklyPlan: (plan: WeeklyPlan): AppAction => ({
    type: "UPDATE_WEEKLY_PLAN",
    payload: plan,
  }),

  resetState: (): AppAction => ({
    type: "RESET_STATE",
  }),
};
