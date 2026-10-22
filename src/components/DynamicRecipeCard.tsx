import React, { useState, useEffect } from "react";
import { Recipe, Ingredient } from "../types";
import { getMacroDeltaSummary, getMacroSummary } from "../utils/nutrition";
import { formatInstructionDurations } from "../utils/durationFormatting";
import {
  Heart,
  ShoppingBag,
  Clock,
  Flame,
  ChefHat,
  CheckCircle2,
  Circle,
  Timer as TimerIcon,
  Repeat,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Users,
  Check,
  Zap,
  Share2,
  MessageSquare,
  Mail,
  Link,
} from "lucide-react";
import { createRecipeShareUrl, getShareMessage } from "../utils/sharing";
import { useMeasurementSystem } from "../context/MeasurementContext";
import {
  formatMeasurement,
  formatMeasurementText,
} from "../utils/measurementFormatting";
import "./DynamicRecipeCard.css";

interface DynamicRecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: boolean;
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
  initialServings?: number;
  darkMode?: boolean;
}

export const DynamicRecipeCard: React.FC<DynamicRecipeCardProps> = ({
  recipe,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onRequestSubstitution,
  initialServings,
  darkMode = true,
}) => {
  const { measurementSystem } = useMeasurementSystem();
  const [currentServings, setCurrentServings] = useState<number>(
    initialServings ?? recipe.servings ?? 4,
  );

  useEffect(() => {
    setCurrentServings(initialServings ?? recipe.servings ?? 4);
  }, [initialServings, recipe.servings]);
  const [checkedIngredients, setCheckedIngredients] = useState<
    Record<string, boolean>
  >({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [showSubstitutions, setShowSubstitutions] = useState<boolean>(true);
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [addedShoppingAlert, setAddedShoppingAlert] = useState<boolean>(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [shareAlert, setShareAlert] = useState<string | null>(null);

  // Toggle ingredient checkbox
  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle step completion checkbox
  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  // Adjust servings
  const baseServings = recipe.servings || 4;
  const calorieValue = recipe.calories || 0;
  const macroSummary = getMacroSummary(recipe.nutritionalInfo);

  // Scale ingredient amounts mathematically
  const getScaledAmount = (amount: number) => {
    const val = (amount * currentServings) / baseServings;
    return Number(Number.isInteger(val) ? val : val.toFixed(1));
  };

  // Export checked or all ingredients to shopping list
  const handleExportShoppingList = () => {
    const ratio = currentServings / baseServings;
    const itemsToAdd = recipe.ingredients.map((ing) => ({
      ...ing,
      amount: Number.isInteger(ing.amount * ratio)
        ? ing.amount * ratio
        : Number(Number.parseFloat((ing.amount * ratio).toFixed(1))),
    }));
    onAddToShoppingList(itemsToAdd, recipe.title, recipe.id);
    setAddedShoppingAlert(true);
    setTimeout(() => setAddedShoppingAlert(false), 3000);
  };

  // Copy recipe to clipboard
  const handleCopyRecipe = () => {
    let txt = `📖 ${recipe.title}\n`;
    txt += `${recipe.summary}\n\n`;
    txt += `⏱️ Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m | Servings: ${currentServings}\n\n`;
    txt += `🛒 INGREDIENTS:\n`;
    recipe.ingredients.forEach((i) => {
      txt += `- ${formatMeasurement(getScaledAmount(i.amount), i.unit, measurementSystem)} ${formatMeasurementText(i.name, measurementSystem)}\n`;
    });
    txt += `\n👨‍🍳 STEPS:\n`;
    recipe.steps.forEach((s) => {
      txt += `${s.stepNumber}. ${formatMeasurementText(s.title, measurementSystem)}: ${formatMeasurementText(s.instruction, measurementSystem)}\n`;
    });

    navigator.clipboard.writeText(txt);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  const handleShare = async (channel: "native" | "copy" | "sms" | "email") => {
    const url = createRecipeShareUrl(recipe);
    const message = getShareMessage(recipe, url);

    if (channel === "native" && navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.summary,
          url,
        });
        setShareAlert("Shared!");
      } catch {
        return;
      }
    } else if (channel === "copy") {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setShareAlert("Link copied");
    } else if (channel === "sms") {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    } else if (channel === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(message)}`;
    }

    setIsShareMenuOpen(false);
    window.setTimeout(() => setShareAlert(null), 2500);
  };

  return (
    <div
      className={`recipe-card ${darkMode ? "recipe-card--dark" : "recipe-card--light"}`}
    >
      {/* Top Banner Header */}
      <div className="recipe-header">
        <div className="recipe-header-info">
          <div className="recipe-tags">
            <span className="recipe-tag recipe-tag--cuisine">
              {recipe.cuisine || "International"}
            </span>
            <span className="recipe-tag recipe-tag--difficulty">
              {recipe.difficulty || "Easy"}
            </span>
            {recipe.dietaryTags?.map((tag, idx) => (
              <span key={idx} className="recipe-tag recipe-tag--dietary">
                {tag}
              </span>
            ))}
          </div>

          <h2 className="recipe-title">{recipe.title}</h2>
          <p className="recipe-summary">
            {formatMeasurementText(recipe.summary, measurementSystem)}
          </p>
        </div>

        {/* Favorite & Share Buttons */}
        <div className="recipe-actions">
          <button
            id={`btn-fav-${recipe.id}`}
            onClick={() => onToggleFavorite(recipe)}
            className={`recipe-fav-btn ${
              isFavorite ? "recipe-fav-btn--active" : "recipe-fav-btn--inactive"
            }`}
            title={
              isFavorite
                ? "Saved to Favorites"
                : "Save Favorite for Offline Access"
            }
          >
            <Heart
              className={`recipe-fav-icon ${isFavorite ? "recipe-fav-icon--active" : ""}`}
            />
          </button>

          <div className="recipe-share-wrapper">
            <button
              id={`btn-share-${recipe.id}`}
              onClick={() => setIsShareMenuOpen((open) => !open)}
              className="recipe-share-btn"
              title="Share recipe"
              aria-label="Share recipe"
              aria-expanded={isShareMenuOpen}
            >
              <Share2 />
            </button>
            {isShareMenuOpen && (
              <div className="recipe-share-menu" role="menu">
                {navigator.share && (
                  <button onClick={() => handleShare("native")} role="menuitem">
                    <Share2 /> Share
                  </button>
                )}
                <button onClick={() => handleShare("copy")} role="menuitem">
                  <Link /> Copy link
                </button>
                <button onClick={() => handleShare("sms")} role="menuitem">
                  <MessageSquare /> Text message
                </button>
                <button onClick={() => handleShare("email")} role="menuitem">
                  <Mail /> Email
                </button>
              </div>
            )}
            {shareAlert && (
              <span className="recipe-share-alert">{shareAlert}</span>
            )}
          </div>

          <button
            id={`btn-cooking-mode-${recipe.id}`}
            onClick={() => onOpenCookingMode(recipe)}
            className="recipe-cook-btn"
            title="Open cook mode"
          >
            <Maximize2 />
            <span className="recipe-cook-btn-label">Cook Mode</span>
          </button>
        </div>
      </div>

      {/* Meta Bar: Prep Time, Cook Time, Servings Scaler, Calories */}
      <div className="recipe-meta-grid">
        <div className="recipe-meta-item">
          <Clock className="recipe-meta-icon recipe-meta-icon--prep" />
          <div>
            <div className="recipe-meta-label">Prep Time</div>
            <div className="recipe-meta-value">
              {recipe.prepTimeMinutes || 10} mins
            </div>
          </div>
        </div>

        <div className="recipe-meta-item">
          <TimerIcon className="recipe-meta-icon recipe-meta-icon--cook" />
          <div>
            <div className="recipe-meta-label">Cook Time</div>
            <div className="recipe-meta-value">
              {recipe.cookTimeMinutes || 15} mins
            </div>
          </div>
        </div>

        <div className="recipe-meta-item recipe-meta-item--servings">
          <Users className="recipe-meta-icon recipe-meta-icon--servings" />
          <div style={{ flex: 1 }}>
            <div className="recipe-meta-label">Servings</div>
            <div className="recipe-servings-controls">
              <button
                onClick={() =>
                  setCurrentServings((count) => Math.max(1, count - 1))
                }
                className="recipe-servings-btn"
              >
                -
              </button>
              <span className="recipe-servings-value">{currentServings}</span>
              <button
                onClick={() => setCurrentServings((count) => count + 1)}
                className="recipe-servings-btn"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="recipe-meta-item">
          <Flame className="recipe-meta-icon recipe-meta-icon--calories" />
          <div>
            <div className="recipe-meta-label">Calories</div>
            <div className="recipe-calories-row">
              <div className="recipe-meta-value">{calorieValue} kcal</div>
              {macroSummary && (
                <div className="recipe-macro-summary">{macroSummary}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Ingredients Checkbox List & Steps */}
      <div className="recipe-main-grid">
        {/* Left Column: Interactive Checkbox Ingredients List */}
        <div className="recipe-ingredients-col">
          <div className="recipe-ingredients-header">
            <div className="recipe-ingredients-title-row">
              <ChefHat />
              <h3 className="recipe-ingredients-heading">
                Ingredients{" "}
                <span className="recipe-count-label">
                  ({recipe.ingredients.length})
                </span>
              </h3>
            </div>
            <button
              id={`btn-add-grocery-${recipe.id}`}
              onClick={handleExportShoppingList}
              className="recipe-export-btn"
            >
              <ShoppingBag />
              <span>{addedShoppingAlert ? "Added!" : "Export to Grocery"}</span>
            </button>
          </div>

          <div className="recipe-ingredients-list recipe-scrollbar">
            {recipe.ingredients.map((ing) => {
              const isChecked = !!checkedIngredients[ing.id];
              return (
                <div
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`recipe-ingredient-item ${
                    isChecked
                      ? "recipe-ingredient-item--checked"
                      : "recipe-ingredient-item--unchecked"
                  }`}
                >
                  <div className="recipe-ingredient-left">
                    <button className="recipe-ingredient-check-btn">
                      {isChecked ? (
                        <CheckCircle2 className="recipe-ingredient-check-icon--checked" />
                      ) : (
                        <Circle className="recipe-ingredient-check-icon--unchecked" />
                      )}
                    </button>
                    <div>
                      <span className="recipe-ingredient-name">
                        {formatMeasurementText(ing.name, measurementSystem)}
                      </span>
                      {ing.notes && (
                        <div className="recipe-ingredient-notes">
                          {formatMeasurementText(ing.notes, measurementSystem)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="recipe-ingredient-right">
                    <span className="recipe-ingredient-amount">
                      {formatMeasurement(
                        getScaledAmount(ing.amount),
                        ing.unit,
                        measurementSystem,
                      )}
                    </span>
                    {onRequestSubstitution && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestSubstitution(ing.name);
                        }}
                        className="recipe-ingredient-sub-btn"
                        title={`Find AI substitution for ${ing.name}`}
                      >
                        <Repeat />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Step-by-Step Instructions with Timers */}
        <div className="recipe-steps-col">
          <div className="recipe-steps-header">
            <div className="recipe-steps-title-row">
              <Sparkles />
              <h3 className="recipe-steps-heading">
                Cooking steps{" "}
                <span className="recipe-count-label">
                  (
                  {
                    Object.keys(completedSteps).filter(
                      (k) => completedSteps[Number(k)],
                    ).length
                  }
                  /{recipe.steps.length} Done)
                </span>
              </h3>
            </div>
            <div className="recipe-steps-hint">
              Click step checkbox or timer button
            </div>
          </div>

          <div className="recipe-steps-list">
            {recipe.steps.map((step) => {
              const isCompleted = !!completedSteps[step.stepNumber];
              return (
                <div
                  key={step.stepNumber}
                  className={`recipe-step-item ${
                    isCompleted
                      ? "recipe-step-item--completed"
                      : "recipe-step-item--active"
                  }`}
                >
                  <div className="recipe-step-row">
                    <button
                      onClick={() => toggleStep(step.stepNumber)}
                      className="recipe-step-check-btn"
                    >
                      {isCompleted ? (
                        <CheckCircle2 />
                      ) : (
                        <div className="recipe-step-number-circle">
                          {step.stepNumber}
                        </div>
                      )}
                    </button>

                    <div className="recipe-step-content">
                      <div className="recipe-step-title-row">
                        <h4
                          className={`recipe-step-title ${isCompleted ? "recipe-step-title--completed" : ""}`}
                        >
                          {step.title}
                        </h4>

                        {step.timerSeconds && step.timerSeconds > 0 && (
                          <button
                            id={`btn-step-timer-${recipe.id}-${step.stepNumber}`}
                            onClick={() =>
                              onStartTimer(
                                `${recipe.title} (Step ${step.stepNumber})`,
                                step.timerSeconds!,
                                recipe.title,
                                step.stepNumber,
                              )
                            }
                            className="recipe-step-timer-btn"
                            title={`Start ${Math.round(step.timerSeconds / 60)} minute timer`}
                          >
                            <TimerIcon />
                            <span>
                              ⏱️ {Math.round(step.timerSeconds / 60)}m Timer
                            </span>
                          </button>
                        )}
                      </div>

                      <p
                        className={`recipe-step-instruction ${isCompleted ? "recipe-step-instruction--completed" : ""}`}
                      >
                        {formatMeasurementText(
                          formatInstructionDurations(step.instruction),
                          measurementSystem,
                        )}
                      </p>

                      {step.tip && (
                        <div className="recipe-step-tip">
                          <Zap className="recipe-step-tip-icon" />
                          <span>
                            <strong>Chef Tip:</strong>{" "}
                            {formatMeasurementText(step.tip, measurementSystem)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ingredient Substitutions Accordion / Panel */}
      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <div className="recipe-subs-section">
          <button
            onClick={() => setShowSubstitutions((prev) => !prev)}
            className="recipe-subs-toggle"
          >
            <div className="recipe-subs-toggle-left">
              <Repeat />
              <span>Ingredient swaps ({recipe.substitutions.length})</span>
            </div>
            {showSubstitutions ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showSubstitutions && (
            <div className="recipe-subs-grid">
              {recipe.substitutions.map((sub, idx) => (
                <div key={idx} className="recipe-sub-card">
                  <div className="recipe-sub-header">
                    <span className="recipe-sub-original">
                      {formatMeasurementText(
                        sub.originalIngredient,
                        measurementSystem,
                      )}
                    </span>
                    <span className="recipe-sub-arrow">➜</span>
                    <span className="recipe-sub-substitute">
                      {formatMeasurementText(sub.substitute, measurementSystem)}
                    </span>
                  </div>
                  <div className="recipe-sub-detail">
                    <span>
                      Ratio:{" "}
                      {formatMeasurementText(
                        sub.ratioOrNote,
                        measurementSystem,
                      )}
                    </span>
                    <span className="recipe-sub-reason">
                      {formatMeasurementText(sub.reason, measurementSystem)}
                    </span>
                  </div>
                  {sub.macroDelta && (
                    <div className="recipe-sub-macro">
                      Net macros: {getMacroDeltaSummary(sub.macroDelta)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chef Notes, Drink Pairing & Footer Action Bar */}
      <div className="recipe-footer">
        <div className="recipe-footer-notes-row">
          {recipe.chefNotes && (
            <div className="recipe-chef-notes-box">
              <div className="recipe-chef-notes-label">Chef Notes</div>
              <div className="recipe-chef-notes-text">
                {formatMeasurementText(recipe.chefNotes, measurementSystem)}
              </div>
            </div>
          )}

          {recipe.drinkPairing && (
            <div className="recipe-drink-box">
              <div className="recipe-drink-label">Drink Pairing</div>
              <div className="recipe-drink-text">
                {formatMeasurementText(recipe.drinkPairing, measurementSystem)}
              </div>
            </div>
          )}
        </div>

        <div className="recipe-copy-row">
          <button onClick={handleCopyRecipe} className="recipe-copy-btn">
            {copiedAlert ? (
              <Check className="recipe-copy-icon--copied" />
            ) : (
              <Printer />
            )}
            <span>{copiedAlert ? "Copied!" : "Copy Recipe"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
