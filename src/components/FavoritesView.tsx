import React, { useState } from "react";
import { Recipe, Ingredient } from "../types";
import { DynamicRecipeCard } from "./DynamicRecipeCard";
import {
  Heart,
  Search,
  Utensils,
  Sparkles,
  Trash2,
  ArrowLeft,
} from "lucide-react";

interface FavoritesViewProps {
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (
    ingredients: Ingredient[],
    recipeTitle: string,
    recipeId: string,
  ) => void;
  onStartTimer: (
    label: string,
    seconds: number,
    recipeTitle?: string,
    stepNumber?: number,
  ) => void;
  onOpenCookingMode: (recipe: Recipe) => void;
  onRequestSubstitution?: (ingredientName: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onToggleFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onRequestSubstitution,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredFavorites = favorites.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.dietaryTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Saved Offline Recipes
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {favorites.length} Saved 💾
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Saved locally for instant offline access in your kitchen
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search saved recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Selected Recipe Detail or Recipe Grid */}
      {selectedRecipe ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Saved List</span>
          </button>

          <DynamicRecipeCard
            recipe={selectedRecipe}
            onToggleFavorite={onToggleFavorite}
            isFavorite={true}
            onAddToShoppingList={onAddToShoppingList}
            onStartTimer={onStartTimer}
            onOpenCookingMode={onOpenCookingMode}
            onRequestSubstitution={onRequestSubstitution}
          />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-200">
            No Offline Recipes Saved Yet
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Click the heart icon on any AI Agent recipe to store it locally for
            offline cooking in your kitchen!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFavorites.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 shadow-xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                    {recipe.cuisine} • {recipe.difficulty}
                  </span>
                  <h3 className="font-bold text-base text-white group-hover:text-orange-300 transition-colors">
                    {recipe.title}
                  </h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe);
                  }}
                  className="p-1.5 text-rose-400 hover:text-slate-500"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {recipe.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span>
                  ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span>•</span>
                <span>👥 {recipe.servings} servings</span>
                <span>•</span>
                <span>🔥 {recipe.calories} kcal</span>
                {recipe.nutritionalInfo && (
                  <span className="text-[10px] text-slate-400">
                    {recipe.nutritionalInfo.protein} P •{" "}
                    {recipe.nutritionalInfo.carbs} C •{" "}
                    {recipe.nutritionalInfo.fat} F
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
