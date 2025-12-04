import {
  AdaptiveChatResponse,
  GeneralChatRequest,
  GeneralChatResponse,
  LoginRequest,
  LoginResponse,
  NextWeekEligibility,
  Recipe,
  RegisterRequest,
  RegisterResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  User,
  UserProfileRequest,
  UserProgress,
  UserRecipeProgress,
  WeeklyPlan,
  WeeklyPlanResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";
const PLAN_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/plan";

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
function getAuthHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("chefpath_token")
      : null;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
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

export const api = {
  async generalChat(
    userId: string,
    chatInput: GeneralChatRequest
  ): Promise<GeneralChatResponse> {
    const response = await fetch(`${PLAN_BASE_URL}/general/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(chatInput),
    });
    return handleResponse<GeneralChatResponse>(response);
  },

  async adaptiveChat(
    userId: string,
    chatInput: GeneralChatRequest
  ): Promise<AdaptiveChatResponse> {
    const response = await fetch(`${PLAN_BASE_URL}/adaptive_chat/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(chatInput),
    });
    return handleResponse<AdaptiveChatResponse>(response);
  },

  async generateWeeklyPlan(
    userId: string,
    initial_intent: string
  ): Promise<WeeklyPlanResponse> {
    const response = await fetch(`${PLAN_BASE_URL}/generate/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ initial_intent }),
    });
    return handleResponse<WeeklyPlanResponse>(response);
  },

  async checkNextWeekEligibility(
    userId: string
  ): Promise<NextWeekEligibility> {
    const response = await fetch(
      `${PLAN_BASE_URL}/can_generate_next_week/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return handleResponse<NextWeekEligibility>(response);
  },

  async generateNextWeekPlan(userId: string): Promise<WeeklyPlanResponse> {
    const response = await fetch(
      `${PLAN_BASE_URL}/generate_next_week/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return handleResponse<WeeklyPlanResponse>(response);
  },

  async chatModifyPlan(
    userId: string,
    user_message: string
  ): Promise<WeeklyPlanResponse> {
    const response = await fetch(`${PLAN_BASE_URL}/chat/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ user_message }),
    });
    return handleResponse<WeeklyPlanResponse>(response);
  },

  async confirmPlanModification(
    userId: string,
    user_message: string
  ): Promise<WeeklyPlanResponse> {
    const response = await fetch(
      `${PLAN_BASE_URL}/chat/confirm_modification/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ user_message }),
      }
    );
    return handleResponse<WeeklyPlanResponse>(response);
  },
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(response);
  },
  // User Management
  async updateUserProfile(userData: UserProfileRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeaders() || {}),
      },
      body: JSON.stringify(userData),
    });

    return handleResponse<User>(response);
  },

  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: Object.assign(
        { "Content-Type": "application/json" },
        getAuthHeaders() || {}
      ),
    });
    return handleResponse<User>(response);
  },

  async updateUser(userId: string, updates: UserProfileRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });

    return handleResponse<User>(response);
  },

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<User[]>(response);
  },

  // Weekly Plans
  async getWeeklyPlan(userId: string, weekNumber: number): Promise<WeeklyPlan> {
    const response = await fetch(
      `${API_BASE_URL}/weekly-plan?user_id=${userId}&week_number=${weekNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return handleResponse<WeeklyPlan>(response);
  },

  async getAllWeeklyPlans(userId: string): Promise<WeeklyPlan[]> {
    const response = await fetch(`${API_BASE_URL}/weekly-plan/${userId}/all`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<WeeklyPlan[]>(response);
  },

  // Recipes
  async getRecipe(recipeId: string): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipe/${recipeId}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<Recipe>(response);
  },

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    const response = await fetch(
      `${API_BASE_URL}/recipes/random?count=${count}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return handleResponse<Recipe[]>(response);
  },

  // Feedback & Progress
  async getRecipeProgress(
    userId: string,
    recipeId: string,
    weekNumber: number
  ): Promise<UserRecipeProgress | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/progress/${userId}/recipe/${recipeId}/week/${weekNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      if (response.status === 404) {
        return null; // No existing feedback
      }
      return handleResponse<UserRecipeProgress>(response);
    } catch (err) {
      return null; // Return null if not found
    }
  },

  async submitFeedback(
    feedbackData: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const response = await fetch(
      `${API_BASE_URL}/feedback/${feedbackData.user_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(feedbackData),
      }
    );

    return handleResponse<SubmitFeedbackResponse>(response);
  },

  async getUserProgress(userId: string): Promise<UserProgress> {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<UserProgress>(response);
  },

  async getWeeklyRecipeProgress(
    userId: string,
    weekNumber: number
  ): Promise<UserRecipeProgress[]> {
    const response = await fetch(
      `${API_BASE_URL}/progress/${userId}/week/${weekNumber}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return handleResponse<UserRecipeProgress[]>(response);
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
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
};

export { ApiError };
