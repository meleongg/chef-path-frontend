import { getAccessToken, setAccessToken } from "@/contexts/AuthContext";
import {
  AdaptiveChatResponse,
  ChangePasswordRequest,
  GeneralChatRequest,
  GeneralChatResponse,
  MessageResponse,
  NextWeekEligibility,
  Recipe,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  SwapRecipeRequest,
  SwapRecipeResponse,
  UpdateAccountRequest,
  UpdateRecipeStatusRequest,
  UpdateRecipeStatusResponse,
  User,
  UserProfileRequest,
  UserProgress,
  UserRecipeProgress,
  WeeklyPlan,
  WeeklyPlanResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL;
const PLAN_BASE_URL = process.env.NEXT_PUBLIC_PLAN_BASE_URL;

class ApiError extends Error {
  public status: number;
  public response?: Response;
  constructor(message: string, status: number, response?: Response) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

/**
 * Get authorization headers with in-memory access token
 */
function getAuthHeaders() {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return undefined;
}

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshingToken = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the HTTP-only refresh cookie
 */
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for that operation to complete
  if (isRefreshingToken && refreshPromise) {
    return refreshPromise;
  }

  isRefreshingToken = true;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include", // Send HTTP-only refresh cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Refresh failed - session expired
        setAccessToken(null);
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return false;
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return false;
    } finally {
      isRefreshingToken = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Handle API responses with automatic token refresh on 401
 */
async function handleResponse<T>(
  response: Response,
  retryFn?: () => Promise<Response>
): Promise<T> {
  // If 401 and we have a retry function, attempt token refresh
  if (response.status === 401 && retryFn && !isRefreshingToken) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the original request with new token
      const retryResponse = await retryFn();
      return handleResponse<T>(retryResponse); // Process retry response (no retry on 2nd attempt)
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status,
      response
    );
  }

  return response.json();
}

/**
 * Helper to create a retry function for fetch requests
 */
function createRetryFn(
  url: string,
  options: RequestInit
): () => Promise<Response> {
  return () => {
    // Update auth headers with new token
    const headers = {
      ...options.headers,
      ...getAuthHeaders(),
    };
    return fetch(url, { ...options, headers });
  };
}

export const api = {
  async generalChat(
    userId: string,
    chatInput: GeneralChatRequest
  ): Promise<GeneralChatResponse> {
    const url = `${PLAN_BASE_URL}/general/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(chatInput),
    };
    const response = await fetch(url, options);
    return handleResponse<GeneralChatResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async adaptiveChat(
    userId: string,
    chatInput: GeneralChatRequest
  ): Promise<AdaptiveChatResponse> {
    const url = `${PLAN_BASE_URL}/adaptive_chat/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(chatInput),
    };
    const response = await fetch(url, options);
    return handleResponse<AdaptiveChatResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async generateWeeklyPlan(
    userId: string,
    initial_intent: string
  ): Promise<WeeklyPlanResponse> {
    const url = `${PLAN_BASE_URL}/generate/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ initial_intent }),
    };
    const response = await fetch(url, options);
    return handleResponse<WeeklyPlanResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async checkNextWeekEligibility(userId: string): Promise<NextWeekEligibility> {
    const url = `${PLAN_BASE_URL}/can_generate_next_week/${userId}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<NextWeekEligibility>(
      response,
      createRetryFn(url, options)
    );
  },

  async generateNextWeekPlan(userId: string): Promise<WeeklyPlanResponse> {
    const url = `${PLAN_BASE_URL}/generate_next_week/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<WeeklyPlanResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async chatModifyPlan(
    userId: string,
    user_message: string
  ): Promise<WeeklyPlanResponse> {
    const url = `${PLAN_BASE_URL}/chat/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ user_message }),
    };
    const response = await fetch(url, options);
    return handleResponse<WeeklyPlanResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async swapRecipe(
    userId: string,
    request: SwapRecipeRequest
  ): Promise<SwapRecipeResponse> {
    const url = `${PLAN_BASE_URL}/swap-recipe/${userId}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    };
    const response = await fetch(url, options);
    return handleResponse<SwapRecipeResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async updateRecipeStatus(
    userId: string,
    recipeId: string,
    weekNumber: number,
    request: UpdateRecipeStatusRequest
  ): Promise<UpdateRecipeStatusResponse> {
    const url = `${API_BASE_URL}/progress/${userId}/recipe/${recipeId}/week/${weekNumber}`;
    const options: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    };
    const response = await fetch(url, options);
    return handleResponse<UpdateRecipeStatusResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  // User Management
  async updateUserProfile(userData: UserProfileRequest): Promise<User> {
    const url = `${API_BASE_URL}/user/profile`;
    const options: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    };
    const response = await fetch(url, options);
    return handleResponse<User>(response, createRetryFn(url, options));
  },

  async getUser(userId: string): Promise<User> {
    const url = `${API_BASE_URL}/user/${userId}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<User>(response, createRetryFn(url, options));
  },

  async updateUser(userId: string, updates: UserProfileRequest): Promise<User> {
    const url = `${API_BASE_URL}/user/${userId}`;
    const options: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    };
    const response = await fetch(url, options);
    return handleResponse<User>(response, createRetryFn(url, options));
  },

  // Account Management
  async updateAccount(
    userId: string,
    accountData: UpdateAccountRequest
  ): Promise<User> {
    const url = `${API_BASE_URL}/users/${userId}/account`;
    const options: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(accountData),
    };
    const response = await fetch(url, options);
    return handleResponse<User>(response, createRetryFn(url, options));
  },

  async changePassword(
    userId: string,
    passwordData: ChangePasswordRequest
  ): Promise<MessageResponse> {
    const url = `${API_BASE_URL}/users/${userId}/password`;
    const options: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(passwordData),
    };
    const response = await fetch(url, options);
    return handleResponse<MessageResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async deleteAccount(userId: string): Promise<MessageResponse> {
    const url = `${API_BASE_URL}/users/${userId}`;
    const options: RequestInit = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<MessageResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async getAllUsers(): Promise<User[]> {
    const url = `${API_BASE_URL}/users`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<User[]>(response, createRetryFn(url, options));
  },

  // Weekly Plans
  async getWeeklyPlan(userId: string, weekNumber: number): Promise<WeeklyPlan> {
    const url = `${API_BASE_URL}/weekly-plan?user_id=${userId}&week_number=${weekNumber}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<WeeklyPlan>(response, createRetryFn(url, options));
  },

  async getAllWeeklyPlans(userId: string): Promise<WeeklyPlan[]> {
    const url = `${API_BASE_URL}/weekly-plan/${userId}/all`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<WeeklyPlan[]>(response, createRetryFn(url, options));
  },

  // Recipes
  async getRecipe(recipeId: string): Promise<Recipe> {
    const url = `${API_BASE_URL}/recipe/${recipeId}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<Recipe>(response, createRetryFn(url, options));
  },

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    const url = `${API_BASE_URL}/recipes/random?count=${count}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<Recipe[]>(response, createRetryFn(url, options));
  },

  // Feedback & Progress
  async getRecipeProgress(
    userId: string,
    recipeId: string,
    weekNumber: number
  ): Promise<UserRecipeProgress | null> {
    try {
      const url = `${API_BASE_URL}/progress/${userId}/recipe/${recipeId}/week/${weekNumber}`;
      const options: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      };
      const response = await fetch(url, options);
      if (response.status === 404) {
        return null; // No existing feedback
      }
      return handleResponse<UserRecipeProgress>(
        response,
        createRetryFn(url, options)
      );
    } catch (err) {
      return null; // Return null if not found
    }
  },

  async submitFeedback(
    feedbackData: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const url = `${API_BASE_URL}/feedback/${feedbackData.user_id}`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(feedbackData),
    };
    const response = await fetch(url, options);
    return handleResponse<SubmitFeedbackResponse>(
      response,
      createRetryFn(url, options)
    );
  },

  async getUserProgress(userId: string): Promise<UserProgress> {
    const url = `${API_BASE_URL}/progress/${userId}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<UserProgress>(response, createRetryFn(url, options));
  },

  async getWeeklyRecipeProgress(
    userId: string,
    weekNumber: number
  ): Promise<UserRecipeProgress[]> {
    const url = `${API_BASE_URL}/progress/${userId}/week/${weekNumber}`;
    const options: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    };
    const response = await fetch(url, options);
    return handleResponse<UserRecipeProgress[]>(
      response,
      createRetryFn(url, options)
    );
  },
};

// Helper functions for parsing JSON strings from API
export const parseHelpers = {
  parseRecipeIngredients(ingredientsJson: string): any[] {
    try {
      return JSON.parse(ingredientsJson);
    } catch (error) {
      console.error("Failed to parse ingredients:", error);
      return [];
    }
  },
  parseRecipeTags(tagsJson: string): string[] {
    try {
      return JSON.parse(tagsJson);
    } catch (error) {
      console.error("Failed to parse tags:", error);
      return [];
    }
  },
  parseRecipeIds(recipeIdsJson: string): number[] {
    try {
      return JSON.parse(recipeIdsJson);
    } catch (error) {
      console.error("Failed to parse recipe IDs:", error);
      return [];
    }
  },
  parseRecipeInstructions(instructionsJson: string | any[]): any[] {
    // If already an array, return it
    if (Array.isArray(instructionsJson)) {
      return instructionsJson;
    }

    // If it's a string, parse it
    if (typeof instructionsJson === "string") {
      try {
        return JSON.parse(instructionsJson);
      } catch (error) {
        console.error("Failed to parse instructions:", error);
        return [];
      }
    }

    return [];
  },
};

export { ApiError };
