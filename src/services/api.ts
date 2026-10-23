import { Recipe, Substitution } from "../types";
import { POPULAR_FALLBACK_RECIPES } from "../data/fallbackRecipes";
import { normalizeRecipeIdentity } from "../utils/recipeIdentity";
import { MeasurementSystem } from "../types";

export interface GenerateRecipeOptions {
  prompt: string;
  dietary?: string[];
  servings?: number;
  cookTimeMax?: number;
  measurementSystem?: MeasurementSystem;
  history?: { userPrompt: string; recipeTitle?: string }[];
}

export interface FetchRecipeResponse {
  recipe?: Recipe & { agentIntro?: string };
  isFallback: boolean;
  isRequestError?: boolean;
  error?: string;
  recommendedRecipes?: Recipe[];
}

export interface FetchSubstitutionsResponse {
  substitutions: Substitution[];
  isRequestError: boolean;
  error?: string;
}

function getFriendlyError(message: string, status?: number) {
  const normalized = (message || "").toLowerCase();
  if (
    status === 401 ||
    status === 403 ||
    normalized.includes("api key") ||
    normalized.includes("auth") ||
    normalized.includes("unauthorized")
  ) {
    return "AI API authentication error. Check your API key.";
  }
  if (status === 429 || normalized.includes("rate limit")) {
    return "Rate limit exceeded. Please wait a moment before retrying.";
  }
  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("disconnected") ||
    normalized.includes("timeout")
  ) {
    return "Network disconnect. Please check your connection and try again.";
  }
  return "AI is unavailable. Please try again.";
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function fetchAIRecipe(
  options: GenerateRecipeOptions,
): Promise<FetchRecipeResponse> {
  try {
    // Construct the full URL using the hardcoded BASE_URL
    const response = await fetch(`${BASE_URL}/api/recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        isFallback: true,
        isRequestError: true,
        error: data?.isRequestError
          ? data.error
          : getFriendlyError(
              data?.error || response.statusText || `HTTP ${response.status}`,
              response.status,
            ),
        recommendedRecipes:
          data?.recommendedRecipes || POPULAR_FALLBACK_RECIPES,
      };
    }

    if (data?.isFallback) {
      return {
        isFallback: true,
        error: data.error,
        recommendedRecipes: data.recommendedRecipes || POPULAR_FALLBACK_RECIPES,
      };
    }

    if (!data?.recipe) {
      return {
        isFallback: true,
        isRequestError: true,
        error: "The recipe service returned an incomplete response.",
        recommendedRecipes: POPULAR_FALLBACK_RECIPES,
      };
    }

    return {
      recipe: normalizeRecipeIdentity(data.recipe),
      isFallback: false,
      recommendedRecipes: data.recommendedRecipes,
    };
  } catch (error: any) {
    console.warn("Error calling /api/recipe, fallback triggered:", error);
    return {
      isFallback: true,
      isRequestError: true,
      error: getFriendlyError(error?.message || ""),
      recommendedRecipes: POPULAR_FALLBACK_RECIPES,
    };
  }
}

export async function fetchAISubstitutions(
  ingredient: string,
  recipeContext?: string,
): Promise<FetchSubstitutionsResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/substitute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredient, recipeContext }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        substitutions: [],
        isRequestError: true,
        error: getFriendlyError(
          data?.error || response.statusText || `HTTP ${response.status}`,
          response.status,
        ),
      };
    }

    return {
      substitutions: data.substitutions || [],
      isRequestError: !!data.isRequestError,
      error: data.error,
    };
  } catch (error) {
    console.warn("Substitutions fetch failed:", error);
    return {
      substitutions: [],
      isRequestError: true,
      error: getFriendlyError(error instanceof Error ? error.message : ""),
    };
  }
}
