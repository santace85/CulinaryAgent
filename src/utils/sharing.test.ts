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
  const encoded = encodeSharedRecipe(recipe);
  assert.match(encoded, /^v2\./);
  const decoded = decodeSharedRecipe(encoded);
  assert.deepEqual(decoded, { ...recipe, isFavorite: undefined });
});

test("invalid shared recipe payloads are rejected", () => {
  assert.equal(decodeSharedRecipe("not-a-payload"), null);
});

test("oversized recipes cannot be encoded into a link", () => {
  let state = 0x12345678;
  const highEntropySummary = Array.from({ length: 20000 }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return String.fromCharCode(32 + (state % 95));
  }).join("");
  assert.throws(() =>
    encodeSharedRecipe({ ...recipe, summary: highEntropySummary }),
  );
});
