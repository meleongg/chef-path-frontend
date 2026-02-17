"use client";

import React, { createContext, ReactNode, useContext, useReducer } from "react";

/**
 * AppContext manages UI state only
 * Server data (recipes, plans, progress) is handled by TanStack Query
 */

// App State Interface - UI state only
interface AppState {
  currentWeek: number;
  isChatOpen: boolean; // For FloatingChat component
}

// Action Types
type AppAction =
  | { type: "SET_CURRENT_WEEK"; payload: number }
  | { type: "TOGGLE_CHAT" }
  | { type: "SET_CHAT_OPEN"; payload: boolean }
  | { type: "RESET_STATE" };

// Initial State
const initialState: AppState = {
  currentWeek: 0, // 0 means not yet initialized, will be set to most recent week
  isChatOpen: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_WEEK":
      return { ...state, currentWeek: action.payload };

    case "TOGGLE_CHAT":
      return { ...state, isChatOpen: !state.isChatOpen };

    case "SET_CHAT_OPEN":
      return { ...state, isChatOpen: action.payload };

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
  setCurrentWeek: (week: number): AppAction => ({
    type: "SET_CURRENT_WEEK",
    payload: week,
  }),

  toggleChat: (): AppAction => ({
    type: "TOGGLE_CHAT",
  }),

  setChatOpen: (isOpen: boolean): AppAction => ({
    type: "SET_CHAT_OPEN",
    payload: isOpen,
  }),

  resetState: (): AppAction => ({
    type: "RESET_STATE",
  }),
};
