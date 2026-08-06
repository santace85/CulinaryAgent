export type IngredientCategory =
  | "Produce"
  | "Dairy & Eggs"
  | "Meat & Seafood"
  | "Pantry & Spices"
  | "Bakery"
  | "Other";

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  notes?: string;
  optional?: boolean;
  isChecked?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
  tip?: string;
  technique?: string;
  isCompleted?: boolean;
}

export interface Substitution {
  originalIngredient: string;
  substitute: string;
  ratioOrNote: string;
  reason: string;
  macroDelta?: {
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  calories: number;
  cuisine: string;
  dietaryTags: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  substitutions: Substitution[];
  chefNotes?: string;
  drinkPairing?: string;
  nutritionalInfo?: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  isFavorite?: boolean;
  userRating?: number;
  createdAt?: string;
  imageUrl?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
  recipeSource?: string;
  recipeId?: string;
  isChecked: boolean;
  addedAt: string;
}

export interface CookingTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  recipeTitle?: string;
  stepNumber?: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  rating?: number;
}

export interface CommunityPost {
  id: string;
  recipe: Recipe;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  caption: string;
  likesCount: number;
  hasLiked?: boolean;
  comments: Comment[];
  createdAt: string;
  photoUrl?: string;
}

export interface AgentMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  recipe?: Recipe;
  substitutionsList?: Substitution[];
  isThinking?: boolean;
  quickPrompts?: string[];
}
