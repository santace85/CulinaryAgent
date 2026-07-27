import React, { useState } from "react";
import { Recipe, Ingredient } from "../types";
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
  Share2,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Users,
  Check,
  Zap,
} from "lucide-react";

interface DynamicRecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: boolean;
  onAddToShoppingList: (ingredients: Ingredient[], recipeTitle: string, recipeId: string) => void;
  onStartTimer: (label: string, seconds: number, recipeTitle?: string, stepNumber?: number) => void;
  onOpenCookingMode: (recipe: Recipe) => void;
  onShareToCommunity: (recipe: Recipe) => void;
  onRequestSubstitution?: (ingredientName: string) => void;
  darkMode?: boolean;
}

export const DynamicRecipeCard: React.FC<DynamicRecipeCardProps> = ({
  recipe,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onShareToCommunity,
  onRequestSubstitution,
  darkMode = true,
}) => {
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [showSubstitutions, setShowSubstitutions] = useState<boolean>(true);
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [addedShoppingAlert, setAddedShoppingAlert] = useState<boolean>(false);

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
  const currentServings = Math.max(1, Math.round(baseServings * servingMultiplier));

  // Scale ingredient amounts mathematically
  const getScaledAmount = (amount: number) => {
    const val = amount * servingMultiplier;
    return Number.isInteger(val) ? val.toString() : val.toFixed(1);
  };

  // Export checked or all ingredients to shopping list
  const handleExportShoppingList = () => {
    const itemsToAdd = recipe.ingredients.map((ing) => ({
      ...ing,
      amount: ing.amount * servingMultiplier,
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
      txt += `- ${getScaledAmount(i.amount)} ${i.unit} ${i.name}\n`;
    });
    txt += `\n👨‍🍳 STEPS:\n`;
    recipe.steps.forEach((s) => {
      txt += `${s.stepNumber}. ${s.title}: ${s.instruction}\n`;
    });

    navigator.clipboard.writeText(txt);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  const cardBg = darkMode
    ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl"
    : "bg-white border-slate-200 text-slate-800 shadow-lg";

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${cardBg}`}>
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {recipe.cuisine || "International"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {recipe.difficulty || "Easy"}
            </span>
            {recipe.dietaryTags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{recipe.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{recipe.summary}</p>
        </div>

        {/* Favorite & Share Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id={`btn-fav-${recipe.id}`}
            onClick={() => onToggleFavorite(recipe)}
            className={`p-2.5 rounded-xl border transition-all ${
              isFavorite
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title={isFavorite ? "Saved to Favorites" : "Save Favorite for Offline Access"}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-400 text-rose-400" : ""}`} />
          </button>

          <button
            id={`btn-share-${recipe.id}`}
            onClick={() => onShareToCommunity(recipe)}
            className="p-2.5 rounded-xl border bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
            title="Share with Culinary Community"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            id={`btn-cooking-mode-${recipe.id}`}
            onClick={() => onOpenCookingMode(recipe)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium text-xs shadow-md shadow-orange-600/30 hover:brightness-110 transition-all"
            title="Open Hands-Free Step-by-Step Cooking Mode"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Cook Mode</span>
          </button>
        </div>
      </div>

      {/* Meta Bar: Prep Time, Cook Time, Servings Scaler, Calories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800/80 my-2">
        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Prep Time</div>
            <div className="text-xs font-bold text-slate-200">{recipe.prepTimeMinutes || 10} mins</div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <TimerIcon className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Cook Time</div>
            <div className="text-xs font-bold text-slate-200">{recipe.cookTimeMinutes || 15} mins</div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <Users className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Servings</div>
            <div className="flex items-center space-x-1 mt-0.5">
              <button
                onClick={() => setServingMultiplier((m) => Math.max(0.5, m - 0.5))}
                className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-700"
              >
                -
              </button>
              <span className="text-xs font-bold text-emerald-300 px-1">{currentServings}</span>
              <button
                onClick={() => setServingMultiplier((m) => m + 0.5)}
                className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
          <Flame className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Calories</div>
            <div className="text-xs font-bold text-slate-200">
              {recipe.calories ? Math.round(recipe.calories * (servingMultiplier || 1)) : 450} kcal
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Ingredients Checkbox List & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4">
        {/* Left Column: Interactive Checkbox Ingredients List */}
        <div className="lg:col-span-5 space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-200">
                Ingredients <span className="text-xs font-normal text-slate-400">({recipe.ingredients.length})</span>
              </h3>
            </div>
            <button
              id={`btn-add-grocery-${recipe.id}`}
              onClick={handleExportShoppingList}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-600/30 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{addedShoppingAlert ? "Added!" : "Export to Grocery"}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {recipe.ingredients.map((ing) => {
              const isChecked = !!checkedIngredients[ing.id];
              return (
                <div
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`flex items-start justify-between p-2.5 rounded-lg border transition-all cursor-pointer group ${
                    isChecked
                      ? "bg-slate-900/40 border-slate-800 text-slate-500 line-through"
                      : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <button className="mt-0.5 text-orange-400">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </button>
                    <div>
                      <span className="font-medium text-xs sm:text-sm">{ing.name}</span>
                      {ing.notes && <div className="text-[11px] text-slate-400">{ing.notes}</div>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300/90 whitespace-nowrap">
                      {getScaledAmount(ing.amount)} {ing.unit}
                    </span>
                    {onRequestSubstitution && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestSubstitution(ing.name);
                        }}
                        className="text-[10px] text-slate-400 hover:text-orange-300 p-1 rounded hover:bg-slate-800"
                        title={`Find AI substitution for ${ing.name}`}
                      >
                        <Repeat className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Step-by-Step Instructions with Timers */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-sm text-slate-200">
                Step-by-Step Cooking Guide{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({Object.keys(completedSteps).filter((k) => completedSteps[Number(k)]).length}/{recipe.steps.length}{" "}
                  Done)
                </span>
              </h3>
            </div>
            <div className="text-xs text-slate-400">Click step checkbox or timer button</div>
          </div>

          <div className="space-y-3">
            {recipe.steps.map((step) => {
              const isCompleted = !!completedSteps[step.stepNumber];
              return (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                      : "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStep(step.stepNumber)}
                      className="mt-0.5 shrink-0 text-orange-400"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600 font-semibold text-[11px] flex items-center justify-center text-slate-400 hover:border-orange-400 hover:text-orange-400">
                          {step.stepNumber}
                        </div>
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm ${isCompleted ? "line-through text-slate-400" : "text-white"}`}>
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
                                step.stepNumber
                              )
                            }
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 transition-all shadow-sm"
                            title={`Start ${Math.round(step.timerSeconds / 60)} minute timer`}
                          >
                            <TimerIcon className="w-3.5 h-3.5" />
                            <span>⏱️ {Math.round(step.timerSeconds / 60)}m Timer</span>
                          </button>
                        )}
                      </div>

                      <p className={`text-xs sm:text-sm leading-relaxed ${isCompleted ? "text-slate-500" : "text-slate-300"}`}>
                        {step.instruction}
                      </p>

                      {step.tip && (
                        <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-200/90 p-2 rounded-lg mt-1 flex items-start gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Chef Tip:</strong> {step.tip}
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
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowSubstitutions((prev) => !prev)}
            className="flex items-center justify-between w-full py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
          >
            <div className="flex items-center space-x-2">
              <Repeat className="w-4 h-4 text-emerald-400" />
              <span>Ingredient Substitutions & Swaps ({recipe.substitutions.length})</span>
            </div>
            {showSubstitutions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSubstitutions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
              {recipe.substitutions.map((sub, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-rose-300/90 line-through">{sub.originalIngredient}</span>
                    <span className="text-slate-500">➜</span>
                    <span className="text-emerald-300 font-bold">{sub.substitute}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Ratio: {sub.ratioOrNote}</span>
                    <span className="text-amber-300/80">{sub.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chef Notes & Footer Action Bar */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {recipe.chefNotes && (
          <div className="text-slate-400 italic text-xs max-w-xl">
            💡 <strong>Chef Notes:</strong> {recipe.chefNotes}
          </div>
        )}

        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={handleCopyRecipe}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {copiedAlert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Printer className="w-3.5 h-3.5" />}
            <span>{copiedAlert ? "Copied!" : "Copy Recipe"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
