import test from "node:test";
import assert from "node:assert/strict";
import { Recipe } from "../types";
import { decodeSharedRecipe, encodeSharedRecipe } from "./sharing";

const recipe: Recipe = {
  id: "recipe_test_1",
  title: "Test Pasta",
  summary: "A simple pasta recipe.",
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  servings: 2,
  difficulty: "Easy",
  calories: 500,
  cuisine: "Italian",
  dietaryTags: [],
  ingredients: [
    {
      id: "ingredient_1",
      name: "Pasta",
      amount: 200,
      unit: "g",
      category: "Pantry & Spices",
    },
  ],
  steps: [{ stepNumber: 1, title: "Cook", instruction: "Boil the pasta." }],
  substitutions: [],
  isFavorite: true,
};

test("shared recipe payload round-trips without transient favorite state", () => {
  const decoded = decodeSharedRecipe(encodeSharedRecipe(recipe));
  assert.deepEqual(decoded, { ...recipe, isFavorite: undefined });
});

test("invalid shared recipe payloads are rejected", () => {
  assert.equal(decodeSharedRecipe("not-a-payload"), null);
});

test("oversized recipes cannot be encoded into a link", () => {
  assert.throws(() =>
    encodeSharedRecipe({ ...recipe, summary: "x".repeat(20000) }),
  );
});
