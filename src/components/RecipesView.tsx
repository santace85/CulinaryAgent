import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Link2,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Recipe, Ingredient } from "../types";
import { DynamicRecipeCard } from "./DynamicRecipeCard";
import { useMeasurementSystem } from "../context/MeasurementContext";
import { formatMeasurementText } from "../utils/measurementFormatting";
import "./RecipesView.css";

type RecipeSource = "hearted" | "shared" | "sampled" | "suggested";
type RecipeFilter = "all" | RecipeSource;

interface RecipeEntry {
  recipe: Recipe;
  sources: Set<RecipeSource>;
}

interface RecipesViewProps {
  favorites: Recipe[];
  sharedRecipes: Recipe[];
  suggestedRecipes: Recipe[];
  sampleRecipes: Recipe[];
  hiddenSampleIds: string[];
  initialRecipe?: Recipe | null;
  onInitialRecipeOpened?: () => void;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  onRemoveSharedRecipe: (id: string) => void;
  onHideSampleRecipe: (id: string) => void;
  onRestoreSamples: () => void;
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

const FILTERS: { id: RecipeFilter; label: string }[] = [
  { id: "all", label: "All recipes" },
  { id: "hearted", label: "Hearted" },
  { id: "shared", label: "Shared" },
  { id: "sampled", label: "Sampled" },
  { id: "suggested", label: "Suggested" },
];

const SOURCE_LABELS: Record<RecipeSource, string> = {
  hearted: "Hearted",
  shared: "Shared",
  sampled: "Sampled",
  suggested: "Suggested",
};

export const RecipesView: React.FC<RecipesViewProps> = ({
  favorites,
  sharedRecipes,
  suggestedRecipes,
  sampleRecipes,
  hiddenSampleIds,
  initialRecipe,
  onInitialRecipeOpened,
  onToggleFavorite,
  isFavorite,
  onRemoveSharedRecipe,
  onHideSampleRecipe,
  onRestoreSamples,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onRequestSubstitution,
}) => {
  const { measurementSystem } = useMeasurementSystem();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<RecipeFilter>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!initialRecipe) return;
    setSelectedRecipe(initialRecipe);
    onInitialRecipeOpened?.();
  }, [initialRecipe, onInitialRecipeOpened]);

  const entries = useMemo(() => {
    const byId = new Map<string, RecipeEntry>();
    const addRecipes = (recipes: Recipe[], source: RecipeSource) => {
      recipes.forEach((recipe) => {
        const existing = byId.get(recipe.id);
        if (existing) {
          existing.sources.add(source);
        } else {
          byId.set(recipe.id, { recipe, sources: new Set([source]) });
        }
      });
    };

    addRecipes(favorites, "hearted");
    addRecipes(sharedRecipes, "shared");
    addRecipes(suggestedRecipes, "suggested");
    addRecipes(
      sampleRecipes.filter((recipe) => !hiddenSampleIds.includes(recipe.id)),
      "sampled",
    );
    return Array.from(byId.values());
  }, [
    favorites,
    hiddenSampleIds,
    sampleRecipes,
    sharedRecipes,
    suggestedRecipes,
  ]);

  const filterCounts = useMemo(() => {
    const counts: Record<RecipeFilter, number> = {
      all: entries.length,
      hearted: 0,
      shared: 0,
      sampled: 0,
      suggested: 0,
    };
    entries.forEach(({ sources }) => {
      sources.forEach((source) => {
        counts[source] += 1;
      });
    });
    return counts;
  }, [entries]);

  const visibleEntries = entries.filter(({ recipe, sources }) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesFilter = activeFilter === "all" || sources.has(activeFilter);
    const matchesSearch =
      !query ||
      recipe.title.toLowerCase().includes(query) ||
      recipe.summary.toLowerCase().includes(query) ||
      recipe.cuisine.toLowerCase().includes(query) ||
      recipe.dietaryTags.some((tag) => tag.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const hiddenSampleCount = sampleRecipes.filter((recipe) =>
    hiddenSampleIds.includes(recipe.id),
  ).length;

  return (
    <div className="recipes-container">
      <section className="recipes-header">
        <div className="recipes-header-main">
          <div className="recipes-brand">
            <div className="recipes-icon-box">
              <BookOpen aria-hidden="true" />
            </div>
            <div>
              <h1 className="recipes-title">Your recipes</h1>
              <p className="recipes-subtitle">
                Shared, hearted, suggested, and sample recipes—all in one place.
              </p>
            </div>
          </div>
          <div className="recipes-header-actions">
            {hiddenSampleCount > 0 && (
              <button
                type="button"
                className="recipes-restore-btn"
                onClick={onRestoreSamples}
              >
                <RotateCcw aria-hidden="true" />
                Restore samples
                <span>{hiddenSampleCount}</span>
              </button>
            )}
            <label className="recipes-search">
              <Search className="recipes-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search your recipes..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search recipes"
              />
            </label>
          </div>
        </div>

        <div className="recipes-filters" role="group" aria-label="Filter recipes">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveFilter(id)}
              className={`recipes-filter${activeFilter === id ? " recipes-filter--active" : ""}`}
              aria-pressed={activeFilter === id}
            >
              {id === "hearted" && <Heart aria-hidden="true" />}
              {id === "shared" && <Link2 aria-hidden="true" />}
              {id === "suggested" && <Sparkles aria-hidden="true" />}
              <span>{label}</span>
              <span className="recipes-filter-count">{filterCounts[id]}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedRecipe ? (
        <div className="recipes-detail">
          <button
            type="button"
            onClick={() => setSelectedRecipe(null)}
            className="recipes-back-btn"
          >
            <ArrowLeft aria-hidden="true" />
            <span>Back to recipes</span>
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
      ) : visibleEntries.length > 0 ? (
        <div className="recipes-grid">
          {visibleEntries.map(({ recipe, sources }) => (
            <article key={recipe.id} className="recipes-card">
              <div className="recipes-card-tags">
                {Array.from(sources).map((source) => (
                  <span
                    key={source}
                    className={`recipes-source-tag recipes-source-tag--${source}`}
                  >
                    {SOURCE_LABELS[source]}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="recipes-card-open"
                onClick={() => setSelectedRecipe(recipe)}
                aria-label={`Open ${recipe.title}`}
              >
                <span className="recipes-card-meta">
                  {recipe.cuisine} · {recipe.difficulty}
                </span>
                <span className="recipes-card-title">{recipe.title}</span>
                <span className="recipes-card-summary">
                  {formatMeasurementText(recipe.summary, measurementSystem)}
                </span>
              </button>
              <div className="recipes-card-footer">
                <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
                <span>{recipe.servings} servings</span>
                <span>{recipe.calories} kcal</span>
              </div>
              <div className="recipes-card-actions">
                <button
                  type="button"
                  className={`recipes-action-btn${isFavorite(recipe.id) ? " recipes-action-btn--hearted" : ""}`}
                  onClick={() => onToggleFavorite(recipe)}
                  aria-label={
                    isFavorite(recipe.id)
                      ? `Remove ${recipe.title} from hearted recipes`
                      : `Add ${recipe.title} to hearted recipes`
                  }
                  title={
                    isFavorite(recipe.id)
                      ? "Remove heart"
                      : "Add to hearted recipes"
                  }
                >
                  <Heart
                    aria-hidden="true"
                    fill={isFavorite(recipe.id) ? "currentColor" : "none"}
                  />
                </button>
                {sources.has("sampled") && (
                  <button
                    type="button"
                    className="recipes-action-btn recipes-action-btn--remove"
                    onClick={() => onHideSampleRecipe(recipe.id)}
                    aria-label={`Hide sample recipe ${recipe.title}`}
                    title="Remove sample from this list"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                )}
                {sources.has("shared") && (
                  <button
                    type="button"
                    className="recipes-action-btn recipes-action-btn--remove"
                    onClick={() => onRemoveSharedRecipe(recipe.id)}
                    aria-label={`Remove shared recipe ${recipe.title}`}
                    title="Remove shared recipe"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="recipes-empty-state">
          <BookOpen className="recipes-empty-icon" aria-hidden="true" />
          <h2>
            {entries.length === 0
              ? "Your recipe collection is ready"
              : "No recipes match this view"}
          </h2>
          <p>
            {entries.length === 0
              ? "Try cooking with AI, or restore sample recipes to get started."
              : searchQuery
                ? "Try another search or choose a different filter."
                : "Try another filter to see more of your collection."}
          </p>
          {hiddenSampleCount > 0 && (
            <button
              type="button"
              className="recipes-restore-btn"
              onClick={onRestoreSamples}
            >
              <RotateCcw aria-hidden="true" />
              Restore sample recipes
            </button>
          )}
        </div>
      )}
    </div>
  );
};
