import {
  Recipe,
  ShoppingListItem,
  CookingTimer,
  MeasurementSystem,
} from "../types";
import {
  formatMeasurement,
  formatMeasurementText,
} from "./measurementFormatting";

const FAVORITES_KEY = "culinary_favorites_v1";
const SHARED_RECIPES_KEY = "culinary_shared_recipes_v1";
const SHOPPING_KEY = "culinary_shopping_list_v1";
const TIMERS_KEY = "culinary_active_timers_v1";
const MEASUREMENT_SYSTEM_KEY = "culinary_measurement_system_v1";
const CHEATSHEET_NOTES_KEY = "culinary_cheatsheet_notes_v1";
const CHEATSHEET_DATA_KEY = "culinary_cheatsheet_data_v1";

export interface CheatsheetCard {
  id: string;
  title: string;
  group: string;
  value: string;
  detail: string;
  kind: "temperature" | "note";
  isDefault?: boolean;
}

export interface CheatsheetData {
  cards: CheatsheetCard[];
  groupOrder: string[];
  groupColors?: Record<string, string>;
  removedDefaultIds?: string[];
}

export function getStoredCheatsheetData(): CheatsheetData | null {
  try {
    const raw = localStorage.getItem(CHEATSHEET_DATA_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as CheatsheetData).cards) ||
      !Array.isArray((parsed as CheatsheetData).groupOrder)
    ) {
      return null;
    }
    return parsed as CheatsheetData;
  } catch {
    return null;
  }
}

export function saveCheatsheetData(data: CheatsheetData): void {
  try {
    localStorage.setItem(CHEATSHEET_DATA_KEY, JSON.stringify(data));
  } catch {
    // Keep edits available for the current session if storage is unavailable.
  }
}

export interface CheatsheetNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export function getStoredCheatsheetNotes(): CheatsheetNote[] {
  try {
    const raw = localStorage.getItem(CHEATSHEET_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCheatsheetNotes(notes: CheatsheetNote[]): void {
  try {
    localStorage.setItem(CHEATSHEET_NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Notes remain available for the current session if storage is unavailable.
  }
}

export function getStoredMeasurementSystem(): MeasurementSystem {
  try {
    return localStorage.getItem(MEASUREMENT_SYSTEM_KEY) === "imperial"
      ? "imperial"
      : "metric";
  } catch {
    return "metric";
  }
}

export function saveMeasurementSystem(system: MeasurementSystem): void {
  try {
    localStorage.setItem(MEASUREMENT_SYSTEM_KEY, system);
  } catch {
    // The setting remains available for the current session if storage is unavailable.
  }
}

// Favorites Local Storage
export function getStoredFavorites(): Recipe[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteRecipe(recipe: Recipe): Recipe[] {
  const current = getStoredFavorites();
  const exists = current.some((r) => r.id === recipe.id);
  let updated: Recipe[];
  if (exists) {
    updated = current.filter((r) => r.id !== recipe.id);
  } else {
    updated = [{ ...recipe, isFavorite: true }, ...current];
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export function isRecipeFavorite(id: string): boolean {
  return getStoredFavorites().some((r) => r.id === id);
}

export function getStoredSharedRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(SHARED_RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSharedRecipe(recipe: Recipe): Recipe[] {
  const current = getStoredSharedRecipes();
  const updated = [recipe, ...current.filter((item) => item.id !== recipe.id)];
  localStorage.setItem(SHARED_RECIPES_KEY, JSON.stringify(updated));
  return updated;
}

export function removeSharedRecipe(id: string): Recipe[] {
  const updated = getStoredSharedRecipes().filter((recipe) => recipe.id !== id);
  localStorage.setItem(SHARED_RECIPES_KEY, JSON.stringify(updated));
  return updated;
}

// Shopping List Local Storage
export function getStoredShoppingList(): ShoppingListItem[] {
  try {
    const raw = localStorage.getItem(SHOPPING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveShoppingList(items: ShoppingListItem[]): void {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(items));
}

// Active Timers Local Storage
export function getStoredTimers(): CookingTimer[] {
  try {
    const raw = localStorage.getItem(TIMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTimers(timers: CookingTimer[]): void {
  localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

// Export shopping list as formatted plaintext or downloadable file
export function exportShoppingListAsText(
  items: ShoppingListItem[],
  measurementSystem: MeasurementSystem = "metric",
): string {
  if (!items.length) return "Shopping list is empty.";

  const categories = Array.from(new Set(items.map((i) => i.category)));
  let text = `GROCERY LIST - CooksALotl AI\nGenerated: ${new Date().toLocaleDateString()}\n${"-".repeat(40)}\n\n`;

  categories.forEach((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (!catItems.length) return;
    text += `📌 ${cat.toUpperCase()}\n`;
    catItems.forEach((item) => {
      const box = item.isChecked ? "[x]" : "[ ]";
      text += `  ${box} ${item.amount > 0 ? formatMeasurement(item.amount, item.unit, measurementSystem) + " " : ""}${formatMeasurementText(item.name, measurementSystem)}${
        item.recipeSource ? ` (for ${item.recipeSource})` : ""
      }\n`;
    });
    text += "\n";
  });

  return text;
}

export function downloadTextFile(filename: string, text: string): void {
  const element = document.createElement("a");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
