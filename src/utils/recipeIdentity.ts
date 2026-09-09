import { Ingredient, Recipe } from "../types";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeRecipeIdentity(recipe: Recipe): Recipe {
  const recipeId =
    typeof recipe.id === "string" && recipe.id.trim()
      ? recipe.id.trim()
      : createId("recipe");

  const ingredients = (
    Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  ).map((ingredient: Ingredient, index) => ({
    ...ingredient,
    id:
      typeof ingredient.id === "string" && ingredient.id.trim()
        ? ingredient.id.trim()
        : `${recipeId}_ingredient_${index + 1}`,
  }));

  return {
    ...recipe,
    id: recipeId,
    ingredients,
  };
}
