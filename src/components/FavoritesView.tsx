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
import "./FavoritesView.css";

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
    <div className="fav-container">
      {/* Top Banner Header */}
      <div className="fav-header-card">
        <div className="fav-header-row">
          <div className="fav-brand">
            <div className="fav-icon-box">
              <Heart />
            </div>
            <div>
              <h1 className="fav-title">
                Saved Offline Recipes
                <span className="fav-count-badge">
                  {favorites.length} Saved 💾
                </span>
              </h1>
              <p className="fav-subtitle">
                Saved locally for instant offline access in your kitchen
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="fav-search-wrapper">
            <Search className="fav-search-icon" />
            <input
              type="text"
              placeholder="Search saved recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="fav-search-input"
            />
          </div>
        </div>
      </div>

      {/* Selected Recipe Detail or Recipe Grid */}
      {selectedRecipe ? (
        <div className="fav-detail">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="fav-back-btn"
          >
            <ArrowLeft />
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
        <div className="fav-empty-state">
          <Heart className="fav-empty-icon" />
          <h2 className="fav-empty-title">No saved recipes</h2>
          <p className="fav-empty-desc">
            Save a recipe with the heart icon to find it here.
          </p>
        </div>
      ) : (
        <div className="fav-grid">
          {filteredFavorites.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="fav-card"
            >
              <div className="fav-card-top-row">
                <div>
                  <span className="fav-card-meta">
                    {recipe.cuisine} • {recipe.difficulty}
                  </span>
                  <h3 className="fav-card-title">{recipe.title}</h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe);
                  }}
                  className="fav-card-remove-btn"
                  title="Remove from favorites"
                >
                  <Trash2 />
                </button>
              </div>

              <p className="fav-card-summary">{recipe.summary}</p>

              <div className="fav-card-footer">
                <span>
                  ⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span>•</span>
                <span>👥 {recipe.servings} servings</span>
                <span>•</span>
                <span>🔥 {recipe.calories} kcal</span>
                {recipe.nutritionalInfo && (
                  <span className="fav-card-macro">
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
