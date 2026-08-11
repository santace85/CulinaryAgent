import React, { useState, useEffect } from "react";
import { NavbarHeader } from "./components/NavbarHeader";
import { AgentChatWindow } from "./components/AgentChatWindow";
import { FavoritesView } from "./components/FavoritesView";
import { ShoppingListView } from "./components/ShoppingListView";
import { SubstitutionsGuide } from "./components/SubstitutionsGuide";
import { TimersModal } from "./components/TimersModal";
import { CookingModeModal } from "./components/CookingModeModal";

import {
  Recipe,
  Ingredient,
  ShoppingListItem,
  CookingTimer,
  AgentMessage,
} from "./types";
import {
  getStoredFavorites,
  saveFavoriteRecipe,
  getStoredShoppingList,
  saveShoppingList,
  getStoredTimers,
  saveStoredTimers,
} from "./utils/storage";
import { STARTER_RECIPES } from "./data/mockRecipes";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "agent" | "favorites" | "shopping" | "substitutions"
  >("agent");

  // State Persistence Initialization
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const stored = getStoredFavorites();
    return stored.length ? stored : STARTER_RECIPES;
  });

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    return getStoredShoppingList();
  });

  const [timers, setTimers] = useState<CookingTimer[]>(() => {
    return getStoredTimers();
  });

  // UI Modals
  const [isTimersOpen, setIsTimersOpen] = useState(false);
  const [cookingModeRecipe, setCookingModeRecipe] = useState<Recipe | null>(
    null,
  );
  const [substitutionQuery, setSubstitutionQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Initial Agent Messages
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "msg_welcome",
      sender: "agent",
      text: "Welcome to **CulinaryAgent AI**! I'm your interactive culinary & recipe agent assistant. Tell me what ingredients you have, dietary restrictions, or meal cravings, and I'll generate a custom recipe with interactive ingredient lists, step-by-step timers, and smart substitutions!",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // Persist timers on update
  useEffect(() => {
    saveStoredTimers(timers);
  }, [timers]);

  // Favorite toggle handler
  const handleToggleFavorite = (recipe: Recipe) => {
    const updated = saveFavoriteRecipe(recipe);
    setFavorites(updated);
  };

  const isFavorite = (id: string) => {
    return favorites.some((r) => r.id === id);
  };

  // Add ingredients to shopping list
  const handleAddToShoppingList = (
    ingredients: Ingredient[],
    recipeTitle: string,
    recipeId: string,
  ) => {
    const newItems: ShoppingListItem[] = ingredients.map((ing) => ({
      id: "shop_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category,
      recipeSource: recipeTitle,
      recipeId,
      isChecked: false,
      addedAt: new Date().toLocaleDateString(),
    }));

    const updated = [...newItems, ...shoppingList];
    setShoppingList(updated);
    saveShoppingList(updated);
  };

  // Start step timer
  const handleStartTimer = (
    label: string,
    seconds: number,
    recipeTitle?: string,
    stepNumber?: number,
  ) => {
    const newTimer: CookingTimer = {
      id: "timer_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      label,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      recipeTitle,
      stepNumber,
    };

    setTimers((prev) => [newTimer, ...prev]);
    setIsTimersOpen(true);
  };

  // Open ingredient substitution
  const handleOpenSubstitution = (ingredientName: string) => {
    setSubstitutionQuery(ingredientName);
    setActiveTab("substitutions");
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans antialiased`}
    >
      {/* Navbar Header */}
      <NavbarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        shoppingListCount={shoppingList.length}
        activeTimersCount={timers.filter((t) => t.isRunning).length}
        onOpenTimers={() => setIsTimersOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Tab View Router */}
      <main className="pb-12">
        {activeTab === "agent" && (
          <AgentChatWindow
            messages={messages}
            setMessages={setMessages}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            onAddToShoppingList={handleAddToShoppingList}
            onStartTimer={handleStartTimer}
            onOpenCookingMode={(recipe) => setCookingModeRecipe(recipe)}
            onOpenSubstitutions={handleOpenSubstitution}
          />
        )}

        {activeTab === "favorites" && (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToShoppingList={handleAddToShoppingList}
            onStartTimer={handleStartTimer}
            onOpenCookingMode={(recipe) => setCookingModeRecipe(recipe)}
            onRequestSubstitution={handleOpenSubstitution}
          />
        )}

        {activeTab === "shopping" && (
          <ShoppingListView
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
          />
        )}

        {activeTab === "substitutions" && (
          <SubstitutionsGuide initialSearch={substitutionQuery} />
        )}
      </main>

      {/* Modals */}
      <TimersModal
        isOpen={isTimersOpen}
        onClose={() => setIsTimersOpen(false)}
        timers={timers}
        setTimers={setTimers}
      />

      <CookingModeModal
        recipe={cookingModeRecipe}
        onClose={() => setCookingModeRecipe(null)}
        onStartTimer={handleStartTimer}
      />
    </div>
  );
}
