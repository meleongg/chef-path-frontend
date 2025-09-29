import {
  CreateUserRequest,
  Recipe,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  UpdateUserRequest,
  User,
  UserProgress,
  WeeklyPlan,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

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
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    return handleResponse<User>(response);
  },

  async updateUser(userId: number, updates: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return handleResponse<User>(response);
  },

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse<User[]>(response);
  },

  // Weekly Plans
  async getWeeklyPlan(userId: number, weekNumber: number): Promise<WeeklyPlan> {
    const response = await fetch(
      `${API_BASE_URL}/weekly-plan?user_id=${userId}&week_number=${weekNumber}`
    );
    return handleResponse<WeeklyPlan>(response);
  },

  async getAllWeeklyPlans(userId: number): Promise<WeeklyPlan[]> {
    const response = await fetch(`${API_BASE_URL}/weekly-plan/${userId}/all`);
    return handleResponse<WeeklyPlan[]>(response);
  },

  // Recipes
  async getRecipe(recipeId: number): Promise<Recipe> {
    const response = await fetch(`${API_BASE_URL}/recipe/${recipeId}`);
    return handleResponse<Recipe>(response);
  },

  async getRandomRecipes(count: number = 5): Promise<Recipe[]> {
    const response = await fetch(
      `${API_BASE_URL}/recipes/random?count=${count}`
    );
    return handleResponse<Recipe[]>(response);
  },

  // Feedback & Progress
  async submitFeedback(
    feedbackData: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    });

    return handleResponse<SubmitFeedbackResponse>(response);
  },

  async getUserProgress(userId: number): Promise<UserProgress> {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}`);
    return handleResponse<UserProgress>(response);
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
