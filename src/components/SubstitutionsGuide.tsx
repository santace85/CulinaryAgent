import React, { useState } from "react";
import { Substitution } from "../types";
import { fetchAISubstitutions } from "../services/api";
import {
  Repeat,
  Search,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";

const COMMON_PRESET_SUBSTITUTIONS: Record<string, Substitution[]> = {
  Buttermilk: [
    {
      originalIngredient: "Buttermilk (1 cup)",
      substitute: "1 cup Milk + 1 tbsp Lemon Juice or White Vinegar",
      ratioOrNote: "Let rest 5-10 mins until curdled",
      reason: "Classic baking swap for pancake & muffin batter acidity.",
    },
    {
      originalIngredient: "Buttermilk (1 cup)",
      substitute: "3/4 cup Plain Yogurt + 1/4 cup Milk",
      ratioOrNote: "1:1 ratio",
      reason: "Provides similar thickness and tangy lactic acid.",
    },
  ],
  Egg: [
    {
      originalIngredient: "Egg (1 whole)",
      substitute: "1 tbsp Ground Flaxseed + 3 tbsp Water",
      ratioOrNote: "Let gel for 5 mins",
      reason: "Vegan baking binder for muffins, cookies & pancakes.",
    },
    {
      originalIngredient: "Egg (1 whole)",
      substitute: "1/4 cup Unsweetened Applesauce or Mashed Banana",
      ratioOrNote: "1/4 cup per egg",
      reason: "Moist fruit binder for quick breads & brownies.",
    },
  ],
  Butter: [
    {
      originalIngredient: "Butter (1 cup)",
      substitute: "1 cup Solid Coconut Oil",
      ratioOrNote: "1:1 ratio",
      reason: "Dairy-free substitute with matching baking fat profile.",
    },
    {
      originalIngredient: "Butter (1 cup)",
      substitute: "3/4 cup Olive Oil or Avocado Oil",
      ratioOrNote: "3/4 cup oil per 1 cup butter",
      reason: "Heart-healthy cooking & savory swap.",
    },
  ],
  "Heavy Cream": [
    {
      originalIngredient: "Heavy Cream (1 cup)",
      substitute: "1 cup Unsweetened Full-Fat Coconut Cream",
      ratioOrNote: "1:1 ratio",
      reason: "Dairy-free rich creaminess for soups & pasta sauces.",
    },
    {
      originalIngredient: "Heavy Cream (1 cup)",
      substitute: "3/4 cup Whole Milk + 1/4 cup Melted Butter",
      ratioOrNote: "Whisk together",
      reason: "Pantry cooking substitute.",
    },
  ],
  "Soy Sauce": [
    {
      originalIngredient: "Soy Sauce (1 tbsp)",
      substitute: "1 tbsp Coconut Aminos",
      ratioOrNote: "1:1 ratio",
      reason: "Gluten-free, lower-sodium, soy-free alternative.",
    },
    {
      originalIngredient: "Soy Sauce (1 tbsp)",
      substitute: "1 tbsp Tamari or Liquid Aminos",
      ratioOrNote: "1:1 ratio",
      reason: "Gluten-free wheat-free swap.",
    },
  ],
  "Baking Powder": [
    {
      originalIngredient: "Baking Powder (1 tsp)",
      substitute: "1/4 tsp Baking Soda + 1/2 tsp Cream of Tartar",
      ratioOrNote: "Mix fresh before adding",
      reason: "Standard chemical leavening substitute.",
    },
  ],
};

interface SubstitutionsGuideProps {
  initialSearch?: string;
}

export const SubstitutionsGuide: React.FC<SubstitutionsGuideProps> = ({
  initialSearch = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [customResults, setCustomResults] = useState<Substitution[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAISearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await fetchAISubstitutions(searchQuery.trim());
      setCustomResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Smart Ingredient Substitution Engine
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20">
                AI Powered ⚡
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Missing an ingredient? Find instant culinary swaps for allergies, dietary needs, or empty pantries.
            </p>
          </div>
        </div>

        {/* AI Search Bar */}
        <form onSubmit={handleAISearch} className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ingredient to substitute (e.g. Buttermilk, Eggs, Heavy Cream, Wine, Yeast...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (customResults) setCustomResults(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Find Swap</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Custom Query Results */}
      {customResults && (
        <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-orange-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Recommended Substitutes for "{searchQuery}":
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customResults.map((sub, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span className="text-slate-400 line-through">{sub.originalIngredient}</span>
                  <span className="text-emerald-400">➜ {sub.substitute}</span>
                </div>
                <div className="text-xs text-amber-300 font-medium">Ratio: {sub.ratioOrNote}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{sub.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Preset Library */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber-400" /> Popular Kitchen Ingredient Swaps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(COMMON_PRESET_SUBSTITUTIONS).map(([title, subs]) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2 pb-2 border-b border-slate-800">
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Substitute for {title}
              </h3>

              <div className="space-y-2.5">
                {subs.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {sub.substitute}
                    </div>
                    <div className="text-[11px] text-amber-300/90 font-medium">Ratio: {sub.ratioOrNote}</div>
                    <div className="text-[11px] text-slate-400">{sub.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
