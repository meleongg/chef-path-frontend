// ChefPath API Types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}
export interface User {
  id: number;
  name: string;
  cuisine: string; // "Italian", "Chinese", "Mexican", "American"
  frequency: number; // meals per week (1-7)
  skill_level: string; // "beginner", "intermediate", "advanced"
  user_goal: string; // e.g., 'techniques', 'cuisine', 'health', 'efficiency', 'confidence'
  created_at: string;
}

export interface Recipe {
  id: number;
  external_id: string; // TheMealDB ID
  name: string;
  cuisine: string;
  ingredients: string; // JSON string of ingredients array
  instructions: string;
  difficulty: string; // "easy", "medium", "hard"
  tags: string; // JSON string of tags array
  image_url: string;
  created_at: string;
}

export interface WeeklyPlan {
  id: number;
  user_id: number;
  week_number: number;
  recipe_ids: string; // JSON string of recipe IDs array
  is_unlocked: boolean;
  created_at: string;
  recipes: Recipe[]; // Populated in responses
}

export interface UserRecipeProgress {
  id: number;
  user_id: number;
  recipe_id: number;
  week_number: number;
  status: string; // "not_started", "in_progress", "completed"
  feedback: string; // "too_easy", "just_right", "too_hard"
  completed_at: string;
  created_at: string;
}

export interface UserProgress {
  total_recipes: number;
  completed_recipes: number;
  current_week: number;
  completion_rate: number;
  skill_progression: string; // "advancing", "stable", "needs_support"
}

// Request/Response Types
export interface CreateUserRequest {
  name: string;
  cuisine: string;
  frequency: number;
  skill_level: string;
  user_goal: string;
}

export interface UpdateUserRequest {
  name?: string;
  cuisine?: string;
  frequency?: number;
  skill_level?: string;
}

export interface SubmitFeedbackRequest {
  user_id: number;
  recipe_id: number;
  week_number: number;
  feedback: string; // "too_easy", "just_right", "too_hard"
}

export interface SubmitFeedbackResponse {
  message: string;
  next_week_unlocked: boolean;
}

// Parsed helper types (for JSON string fields)
export interface ParsedRecipe extends Omit<Recipe, "ingredients" | "tags"> {
  ingredients: string[];
  tags: string[];
}

export interface ParsedWeeklyPlan extends Omit<WeeklyPlan, "recipe_ids"> {
  recipe_ids: number[];
}

// UI State Types
export interface OnboardingFormData {
  name: string;
  cuisine: string;
  frequency: number;
  skill_level: string;
}

export interface FeedbackFormData {
  feedback: "too_easy" | "just_right" | "too_hard";
  notes?: string;
}

// Form validation errors
export interface FormErrors {
  [key: string]: string;
}
