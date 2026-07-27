import { Recipe, Substitution } from "../types";

export interface GenerateRecipeOptions {
  prompt: string;
  dietary?: string[];
  servings?: number;
  cookTimeMax?: number;
}

export async function fetchAIRecipe(options: GenerateRecipeOptions): Promise<{ recipe: Recipe; isFallback: boolean }> {
  try {
    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.recipe) {
      throw new Error("Invalid response schema from backend.");
    }

    return {
      recipe: data.recipe,
      isFallback: !!data.isFallback,
    };
  } catch (error: any) {
    console.warn("Error calling /api/recipe, fallback triggered:", error);
    throw error;
  }
}

export async function fetchAISubstitutions(ingredient: string, recipeContext?: string): Promise<Substitution[]> {
  try {
    const response = await fetch("/api/substitute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ingredient, recipeContext }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch substitutions");
    }

    const data = await response.json();
    return data.substitutions || [];
  } catch (error) {
    console.warn("Substitutions fetch failed:", error);
    return [];
  }
}
