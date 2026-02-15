"use client";

import { LoginRequest, RegisterRequest, User } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Has the initial refresh check completed?
  isLoading: boolean;
  error: string | null;
}

// Auth Context Interface
interface AuthContextValue extends AuthState {
  login: (
    credentials: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUserProfile: (profileData: any) => Promise<User | null>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

// Create Context
const AuthContext = createContext<AuthContextValue | null>(null);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// In-memory token storage (not accessible to XSS attacks)
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: user !== null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh the access token using the HTTP-only refresh cookie
   * Returns true if refresh was successful, false otherwise
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) {
      return false;
    }

    isRefreshing.current = true;

    try {
      const AUTH_BASE_URL =
        process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

      const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include", // Send HTTP-only cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Refresh failed - session expired
        setAccessToken(null);
        setState({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        return false;
      }

      const data = await response.json();

      // Store new access token in memory
      setAccessToken(data.access_token);

      // Fetch user data with the new token
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

      // Get user ID from token payload (JWT decode)
      // For now, we'll need to get it from localStorage or fetch from a /me endpoint
      // Let's assume the backend should return user info in refresh response
      // If not, we'll need to add a /auth/me endpoint

      // For now, try to get stored user ID or fetch current user
      const storedUserId = localStorage.getItem("chefpath_user_id");

      if (storedUserId) {
        const userResponse = await fetch(
          `${API_BASE_URL}/user/${storedUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
          },
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setState({
            user: userData,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
          return true;
        }
      }

      // If we couldn't get user data, clear auth state
      setAccessToken(null);
      setState({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
      return false;
    } catch (error) {
      console.error("Session refresh failed:", error);
      setAccessToken(null);
      setState({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  /**
   * Initialize session on app mount
   * Attempts to restore session using refresh token cookie
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await refreshSession();
    };

    initializeAuth();
  }, [refreshSession]);

  /**
   * Login user with credentials
   */
  const login = useCallback(
    async (
      credentials: LoginRequest,
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const AUTH_BASE_URL =
          process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

        const response = await fetch(`${AUTH_BASE_URL}/login`, {
          method: "POST",
          credentials: "include", // Receive HTTP-only cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorText = await response.text();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              response.status === 401
                ? "Invalid email or password"
                : "Login failed",
          }));
          return {
            success: false,
            error:
              response.status === 401
                ? "Invalid email or password"
                : "Login failed",
          };
        }

        const data = await response.json();

        // Store access token in memory
        setAccessToken(data.access_token);

        // Store user ID for session restoration
        if (data.user?.id) {
          localStorage.setItem("chefpath_user_id", data.user.id);
        }

        // Update state
        setState({
          user: data.user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      data: RegisterRequest,
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const AUTH_BASE_URL =
          process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

        const response = await fetch(`${AUTH_BASE_URL}/register`, {
          method: "POST",
          credentials: "include", // Receive HTTP-only cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorText = await response.text();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Registration failed",
          }));
          return { success: false, error: "Registration failed" };
        }

        const responseData = await response.json();

        if (!responseData.success) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: responseData.message || "Registration failed",
          }));
          return {
            success: false,
            error: responseData.message || "Registration failed",
          };
        }

        // Store access token in memory
        setAccessToken(responseData.access_token);

        // Store user ID for session restoration
        if (responseData.user?.id) {
          localStorage.setItem("chefpath_user_id", responseData.user.id);
        }

        // Update state
        setState({
          user: responseData.user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Registration failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  /**
   * Logout user and clear session
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const AUTH_BASE_URL =
        process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

      // Call logout endpoint to clear refresh token cookie
      await fetch(`${AUTH_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include", // Send cookie to be cleared
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with local cleanup even if request fails
    }

    // Clear local state
    setAccessToken(null);
    localStorage.removeItem("chefpath_user_id");
    localStorage.removeItem("chefpath_token"); // Remove old token if exists

    setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (profileData: any): Promise<User | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Failed to update profile",
          }));
          return null;
        }

        const updatedUser = await response.json();

        // Update user in state
        setState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
          error: null,
        }));

        return updatedUser;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update profile";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    [],
  );

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshSession,
    updateUserProfile,
    setUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
