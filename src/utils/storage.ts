import { Recipe, ShoppingListItem, CookingTimer } from "../types";

const FAVORITES_KEY = "culinary_favorites_v1";
const SHOPPING_KEY = "culinary_shopping_list_v1";
const TIMERS_KEY = "culinary_active_timers_v1";

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
export function exportShoppingListAsText(items: ShoppingListItem[]): string {
  if (!items.length) return "Shopping list is empty.";

  const categories = Array.from(new Set(items.map((i) => i.category)));
  let text = `GROCERY LIST - CooksALotl AI\nGenerated: ${new Date().toLocaleDateString()}\n${"-".repeat(40)}\n\n`;

  categories.forEach((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (!catItems.length) return;
    text += `📌 ${cat.toUpperCase()}\n`;
    catItems.forEach((item) => {
      const box = item.isChecked ? "[x]" : "[ ]";
      text += `  ${box} ${item.amount > 0 ? item.amount + " " : ""}${item.unit ? item.unit + " " : ""}${item.name}${
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
