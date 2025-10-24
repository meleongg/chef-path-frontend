import {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  Recipe,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  UpdateUserRequest,
  User,
  UserProgress,
  UserRecipeProgress,
  WeeklyPlan,
  RegisterRequest,
  RegisterResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:8000/auth";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = "ApiError";
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
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return handleResponse<User>(response);
  },

  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: Object.assign(
        { "Content-Type": "application/json" },
        getAuthHeaders() || {}
      ),
    });
    return handleResponse<User>(response);
  },

  async updateUser(userId: number, updates: UpdateUserRequest): Promise<User> {
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
  async getWeeklyPlan(userId: number, weekNumber: number): Promise<WeeklyPlan> {
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

  async getAllWeeklyPlans(userId: number): Promise<WeeklyPlan[]> {
    const response = await fetch(`${API_BASE_URL}/weekly-plan/${userId}/all`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<WeeklyPlan[]>(response);
  },

  // Recipes
  async getRecipe(recipeId: number): Promise<Recipe> {
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

  async getUserProgress(userId: number): Promise<UserProgress> {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return handleResponse<UserProgress>(response);
  },

  async getWeeklyRecipeProgress(
    userId: number,
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
  parseRecipeIngredients(ingredientsJson: string): string[] {
    try {
      return JSON.parse(ingredientsJson);
    } catch (error) {
      console.error("Failed to parse recipe ingredients:", error);
      return [];
    }
  },

  parseRecipeTags(tagsJson: string): string[] {
    try {
      return JSON.parse(tagsJson);
    } catch (error) {
      console.error("Failed to parse recipe tags:", error);
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
