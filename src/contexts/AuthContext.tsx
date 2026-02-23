"use client";

import {
  LoginRequest,
  RegisterRequest,
  User,
  UserProfileRequest,
} from "@/types";
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
    credentials: LoginRequest
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUserProfile: (profileData: UserProfileRequest) => Promise<User | null>;
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

// Token storage using localStorage
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("refresh_token", token);
  } else {
    localStorage.removeItem("refresh_token");
  }
}

export function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem("chefpath_user");
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

export function setCachedUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("chefpath_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("chefpath_user");
  }
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
   * Refresh the access token using the refresh token from localStorage
   * Returns true if refresh was successful, false otherwise
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) {
      return false;
    }

    isRefreshing.current = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("[AuthContext] No refresh token available");
        setAccessToken(null);
        setRefreshToken(null);
        setState({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        return false;
      }

      const AUTH_BASE_URL =
        process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

      console.log("[AuthContext] Attempting to refresh session...");
      const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      console.log("[AuthContext] Refresh response status:", response.status);

      if (!response.ok) {
        console.log("[AuthContext] Refresh failed - tokens expired");
        setAccessToken(null);
        setRefreshToken(null);
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

      // Store new tokens from response
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);

      // Restore cached user immediately for fast cross-tab experience
      // But only if the user is fully onboarded (has all required fields)
      const cachedUser = getCachedUser();
      const isFullyOnboarded =
        cachedUser &&
        cachedUser.frequency &&
        cachedUser.cuisine &&
        cachedUser.skill_level &&
        cachedUser.user_goal;

      if (isFullyOnboarded) {
        console.log(
          "[AuthContext] Restoring fully onboarded cached user from localStorage for immediate auth"
        );
        setState({
          user: cachedUser,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      }

      // Fetch fresh user data with the new token
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

      const storedUserId = localStorage.getItem("chefpath_user_id");

      if (storedUserId) {
        const userResponse = await fetch(
          `${API_BASE_URL}/user/${storedUserId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Update cache with fresh user data
          setCachedUser(userData);
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
      setRefreshToken(null);
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
      setRefreshToken(null);
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
   * Attempts to restore session using refresh token from localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await refreshSession();
    };

    initializeAuth();
  }, [refreshSession]);

  /**
   * Listen for storage events to sync auth state across tabs
   * When another tab logs in/out, this tab will be notified and update accordingly
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If another tab changed tokens or user cache, refresh auth state in this tab
      if (
        e.key === "access_token" ||
        e.key === "refresh_token" ||
        e.key === "chefpath_user_id" ||
        e.key === "chefpath_user"
      ) {
        console.log("[AuthContext] Storage changed from another tab:", e.key);

        // Get current token state
        const currentAccessToken = getAccessToken();
        const currentRefreshToken = getRefreshToken();

        // If tokens were cleared (logout in another tab), clear this tab's state
        if (!currentAccessToken && !currentRefreshToken) {
          console.log(
            "[AuthContext] Tokens cleared in another tab, clearing this tab"
          );
          setState({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }
        // If tokens were set (login in another tab), refresh session in this tab
        else if (currentAccessToken && currentRefreshToken) {
          console.log(
            "[AuthContext] Tokens set in another tab, syncing this tab"
          );
          // Call refreshSession within the callback to avoid stale closure issues
          (async () => {
            await refreshSession();
          })();
        }
        // If user cache changed, restore it immediately
        else if (e.key === "chefpath_user") {
          const cachedUser = getCachedUser();
          if (cachedUser) {
            console.log(
              "[AuthContext] User cache updated in another tab, restoring"
            );
            setState((prev) => ({
              ...prev,
              user: cachedUser,
              isAuthenticated: true,
            }));
          }
        }
      }
    };

    // Only listen on the client side
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  /**
   * Login user with credentials
   */
  const login = useCallback(
    async (
      credentials: LoginRequest
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const AUTH_BASE_URL =
          process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

        const response = await fetch(`${AUTH_BASE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          await response.text();
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
        setRefreshToken(data.refresh_token);

        // Store user ID and cache user data for session restoration
        if (data.user?.id) {
          localStorage.setItem("chefpath_user_id", data.user.id);
          setCachedUser(data.user);
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
    []
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (
      data: RegisterRequest
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const AUTH_BASE_URL =
          process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

        const response = await fetch(`${AUTH_BASE_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          await response.text();
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

        // Store tokens
        setAccessToken(responseData.access_token);
        setRefreshToken(responseData.refresh_token);

        // Store user ID and cache user data for session restoration
        if (responseData.user?.id) {
          localStorage.setItem("chefpath_user_id", responseData.user.id);
          setCachedUser(responseData.user);
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
    []
  );

  /**
   * Logout user and clear session
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const AUTH_BASE_URL =
        process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

      // Call logout endpoint
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await fetch(`${AUTH_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with local cleanup even if request fails
    }

    // Clear local state
    setAccessToken(null);
    setRefreshToken(null);
    setCachedUser(null);
    localStorage.removeItem("chefpath_user_id");

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
    async (profileData: UserProfileRequest): Promise<User | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
            error: errorText || "Failed to update profile",
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
    []
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
