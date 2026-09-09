import { Recipe } from "../types";
import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

const SHARE_PARAM = "sharedRecipe";
const PAYLOAD_VERSION = 2;
const MAX_PAYLOAD_LENGTH = 14000;
const V2_PREFIX = "v2.";

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
  return bytesToBase64Url(strToU8(value));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return base64ToBytes(padded);
}

function fromBase64Url(value: string): string {
  return strFromU8(base64UrlToBytes(value));
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

function createPayload(recipe: Recipe): string {
  const payload: SharedRecipePayload = {
    version: PAYLOAD_VERSION,
    recipe: { ...recipe, isFavorite: undefined },
  };
  return JSON.stringify(payload);
}

function encodeV1(recipe: Recipe): string {
  const payload = {
    version: 1,
    recipe: { ...recipe, isFavorite: undefined },
  };
  return toBase64Url(JSON.stringify(payload));
}

export function encodeSharedRecipe(recipe: Recipe): string {
  const encoded = `${V2_PREFIX}${bytesToBase64Url(
    deflateSync(strToU8(createPayload(recipe)), { level: 9 }),
  )}`;

  if (encoded.length > MAX_PAYLOAD_LENGTH) {
    throw new Error("This recipe is too large to share in a link.");
  }

  return encoded;
}

export function decodeSharedRecipe(value: string): Recipe | null {
  if (!value || value.length > MAX_PAYLOAD_LENGTH) return null;

  try {
    const isV2 = value.startsWith(V2_PREFIX);
    const prefixLength = isV2 ? V2_PREFIX.length : 0;
    const encodedValue = value.slice(prefixLength);
    const compressed = base64UrlToBytes(encodedValue);
    const json = isV2
      ? strFromU8(inflateSync(compressed))
      : fromBase64Url(encodedValue);
    const payload: unknown = JSON.parse(json);
    if (
      !isRecord(payload) ||
      (isV2 && payload.version !== 2) ||
      (!isV2 && payload.version !== 1) ||
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
