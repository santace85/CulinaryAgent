import React, { useEffect, useState } from "react";
import { Recipe, Ingredient } from "../types";
import { DynamicRecipeCard } from "./DynamicRecipeCard";
import { ArrowLeft, Link2, Search, Trash2 } from "lucide-react";
import { removeSharedRecipe } from "../utils/storage";
import { useMeasurementSystem } from "../context/MeasurementContext";
import { formatMeasurementText } from "../utils/measurementFormatting";
import "./FavoritesView.css";

interface SharedRecipesViewProps {
  recipes: Recipe[];
  initialRecipe?: Recipe | null;
  onRecipesChange: (recipes: Recipe[]) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  onAddToShoppingList: (
    ingredients: Ingredient[],
    title: string,
    id: string,
  ) => void;
  onStartTimer: (
    label: string,
    seconds: number,
    title?: string,
    stepNumber?: number,
  ) => void;
  onOpenCookingMode: (recipe: Recipe) => void;
  onRequestSubstitution?: (ingredientName: string) => void;
}

export const SharedRecipesView: React.FC<SharedRecipesViewProps> = ({
  recipes,
  initialRecipe,
  onRecipesChange,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onRequestSubstitution,
}) => {
  const { measurementSystem } = useMeasurementSystem();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (initialRecipe) setSelectedRecipe(initialRecipe);
  }, [initialRecipe]);

  const filteredRecipes = recipes.filter((recipe) => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.summary.toLowerCase().includes(query) ||
      recipe.cuisine.toLowerCase().includes(query)
    );
  });

  const handleRemove = (id: string) => {
    onRecipesChange(removeSharedRecipe(id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  return (
    <div className="fav-container">
      <div className="fav-header-card">
        <div className="fav-header-row">
          <div className="fav-brand">
            <div className="fav-icon-box">
              <Link2 />
            </div>
            <div>
              <h1 className="fav-title">
                Shared Recipes
                <span className="fav-count-badge">{recipes.length} Saved</span>
              </h1>
              <p className="fav-subtitle">Recipes imported from shared links</p>
            </div>
          </div>
          <div className="fav-search-wrapper">
            <Search className="fav-search-icon" />
            <input
              type="text"
              placeholder="Search shared recipes..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="fav-search-input"
            />
          </div>
        </div>
      </div>

      {selectedRecipe ? (
        <div className="fav-detail">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="fav-back-btn"
          >
            <ArrowLeft />
            <span>Back to Shared Recipes</span>
          </button>
          <DynamicRecipeCard
            recipe={selectedRecipe}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite(selectedRecipe.id)}
            onAddToShoppingList={onAddToShoppingList}
            onStartTimer={onStartTimer}
            onOpenCookingMode={onOpenCookingMode}
            onRequestSubstitution={onRequestSubstitution}
          />
        </div>
      ) : recipes.length === 0 ? (
        <div className="fav-empty-state">
          <Link2 className="fav-empty-icon" />
          <h2 className="fav-empty-title">No shared recipes</h2>
          <p className="fav-empty-desc">
            Recipes opened from a shared link will appear here.
          </p>
        </div>
      ) : (
        <div className="fav-grid">
          {filteredRecipes.map((recipe) => (
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
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove(recipe.id);
                  }}
                  className="fav-card-remove-btn"
                  title="Remove shared recipe"
                >
                  <Trash2 />
                </button>
              </div>
              <p className="fav-card-summary">
                {formatMeasurementText(recipe.summary, measurementSystem)}
              </p>
              <div className="fav-card-footer">
                <span>
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span>•</span>
                <span>{recipe.servings} servings</span>
                <span>•</span>
                <span>{recipe.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
