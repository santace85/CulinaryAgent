import { Recipe } from "../types";

const SHARE_PARAM = "sharedRecipe";
const PAYLOAD_VERSION = 1;
const MAX_PAYLOAD_LENGTH = 14000;

interface SharedRecipePayload {
  version: number;
  recipe: Recipe;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return new TextDecoder().decode(base64ToBytes(padded));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecipe(value: unknown): value is Recipe {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.prepTimeMinutes === "number" &&
    typeof value.cookTimeMinutes === "number" &&
    typeof value.servings === "number" &&
    typeof value.calories === "number" &&
    typeof value.cuisine === "string" &&
    Array.isArray(value.dietaryTags) &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every(
      (ingredient) =>
        isRecord(ingredient) &&
        typeof ingredient.id === "string" &&
        typeof ingredient.name === "string" &&
        typeof ingredient.amount === "number" &&
        typeof ingredient.unit === "string" &&
        typeof ingredient.category === "string",
    ) &&
    Array.isArray(value.steps) &&
    value.steps.every(
      (step) =>
        isRecord(step) &&
        typeof step.stepNumber === "number" &&
        typeof step.title === "string" &&
        typeof step.instruction === "string",
    ) &&
    Array.isArray(value.substitutions)
  );
}

export function encodeSharedRecipe(recipe: Recipe): string {
  const payload: SharedRecipePayload = {
    version: PAYLOAD_VERSION,
    recipe: { ...recipe, isFavorite: undefined },
  };
  const encoded = toBase64Url(JSON.stringify(payload));

  if (encoded.length > MAX_PAYLOAD_LENGTH) {
    throw new Error("This recipe is too large to share in a link.");
  }

  return encoded;
}

export function decodeSharedRecipe(value: string): Recipe | null {
  if (!value || value.length > MAX_PAYLOAD_LENGTH) return null;

  try {
    const payload: unknown = JSON.parse(fromBase64Url(value));
    if (
      !isRecord(payload) ||
      payload.version !== PAYLOAD_VERSION ||
      !isRecipe(payload.recipe)
    ) {
      return null;
    }
    return { ...payload.recipe, isFavorite: undefined };
  } catch {
    return null;
  }
}

export function createRecipeShareUrl(recipe: Recipe): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = `${SHARE_PARAM}=${encodeSharedRecipe(recipe)}`;
  return url.toString();
}

export function readSharedRecipeFromUrl(): Recipe | null {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const value = params.get(SHARE_PARAM);
  return value ? decodeSharedRecipe(value) : null;
}

export function clearSharedRecipeFromUrl(): void {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, document.title, url.toString());
}

export function getShareMessage(recipe: Recipe, url: string): string {
  return `Try this recipe: ${recipe.title}\n${url}`;
}
