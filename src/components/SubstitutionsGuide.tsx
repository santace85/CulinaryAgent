import React, { useState } from "react";
import { Substitution } from "../types";
import { fetchAISubstitutions } from "../services/api";
import { getMacroDeltaSummary } from "../utils/nutrition";
import {
  Repeat,
  Search,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";
import "./SubstitutionsGuide.css";

const COMMON_PRESET_SUBSTITUTIONS: Record<string, Substitution[]> = {
  Buttermilk: [
    {
      originalIngredient: "Buttermilk (1 cup)",
      substitute: "1 cup Milk + 1 tbsp Lemon Juice or White Vinegar",
      ratioOrNote: "Let rest 5-10 mins until curdled",
      reason: "Classic baking swap for pancake & muffin batter acidity.",
      macroDelta: { protein: "+1g", carbs: "0g", fat: "-1g" },
    },
    {
      originalIngredient: "Buttermilk (1 cup)",
      substitute: "3/4 cup Plain Yogurt + 1/4 cup Milk",
      ratioOrNote: "1:1 ratio",
      reason: "Provides similar thickness and tangy lactic acid.",
      macroDelta: { protein: "+2g", carbs: "+1g", fat: "-1g" },
    },
  ],
  Egg: [
    {
      originalIngredient: "Egg (1 whole)",
      substitute: "1 tbsp Ground Flaxseed + 3 tbsp Water",
      ratioOrNote: "Let gel for 5 mins",
      reason: "Vegan baking binder for muffins, cookies & pancakes.",
      macroDelta: { protein: "-3g", carbs: "+1g", fat: "-2g" },
    },
    {
      originalIngredient: "Egg (1 whole)",
      substitute: "1/4 cup Unsweetened Applesauce or Mashed Banana",
      ratioOrNote: "1/4 cup per egg",
      reason: "Moist fruit binder for quick breads & brownies.",
      macroDelta: { protein: "-3g", carbs: "+3g", fat: "-1g" },
    },
  ],
  Butter: [
    {
      originalIngredient: "Butter (1 cup)",
      substitute: "1 cup Solid Coconut Oil",
      ratioOrNote: "1:1 ratio",
      reason: "Dairy-free substitute with matching baking fat profile.",
      macroDelta: { protein: "0g", carbs: "0g", fat: "-2g" },
    },
    {
      originalIngredient: "Butter (1 cup)",
      substitute: "3/4 cup Olive Oil or Avocado Oil",
      ratioOrNote: "3/4 cup oil per 1 cup butter",
      reason: "Heart-healthy cooking & savory swap.",
      macroDelta: { protein: "0g", carbs: "0g", fat: "-1g" },
    },
  ],
  "Heavy Cream": [
    {
      originalIngredient: "Heavy Cream (1 cup)",
      substitute: "1 cup Unsweetened Full-Fat Coconut Cream",
      ratioOrNote: "1:1 ratio",
      reason: "Dairy-free rich creaminess for soups & pasta sauces.",
      macroDelta: { protein: "-2g", carbs: "+1g", fat: "-4g" },
    },
    {
      originalIngredient: "Heavy Cream (1 cup)",
      substitute: "3/4 cup Whole Milk + 1/4 cup Melted Butter",
      ratioOrNote: "Whisk together",
      reason: "Pantry cooking substitute.",
      macroDelta: { protein: "+1g", carbs: "+1g", fat: "+2g" },
    },
  ],
  "Soy Sauce": [
    {
      originalIngredient: "Soy Sauce (1 tbsp)",
      substitute: "1 tbsp Coconut Aminos",
      ratioOrNote: "1:1 ratio",
      reason: "Gluten-free, lower-sodium, soy-free alternative.",
      macroDelta: { protein: "0g", carbs: "+1g", fat: "0g" },
    },
    {
      originalIngredient: "Soy Sauce (1 tbsp)",
      substitute: "1 tbsp Tamari or Liquid Aminos",
      ratioOrNote: "1:1 ratio",
      reason: "Gluten-free wheat-free swap.",
      macroDelta: { protein: "+1g", carbs: "0g", fat: "0g" },
    },
  ],
  "Baking Powder": [
    {
      originalIngredient: "Baking Powder (1 tsp)",
      substitute: "1/4 tsp Baking Soda + 1/2 tsp Cream of Tartar",
      ratioOrNote: "Mix fresh before adding",
      reason: "Standard chemical leavening substitute.",
      macroDelta: { protein: "0g", carbs: "0g", fat: "0g" },
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
  const [customResults, setCustomResults] = useState<Substitution[] | null>(
    null,
  );
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
    <div className="swap-container">
      {/* Header Banner */}
      <div className="swap-header-card">
        <div className="swap-brand-row">
          <div className="swap-icon-box">
            <Repeat />
          </div>
          <div>
            <h1 className="swap-title">
              Smart Ingredient Substitution Engine
              <span className="swap-badge">AI Powered ⚡</span>
            </h1>
            <p className="swap-subtitle">
              Missing an ingredient? Find instant culinary swaps for allergies,
              dietary needs, or empty pantries.
            </p>
          </div>
        </div>

        {/* AI Search Bar */}
        <form onSubmit={handleAISearch} className="swap-search-form">
          <div className="swap-search-wrapper">
            <Search className="swap-search-icon" />
            <input
              type="text"
              placeholder="Search ingredient to substitute (e.g. Buttermilk, Eggs, Heavy Cream, Wine, Yeast...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (customResults) setCustomResults(null);
              }}
              className="swap-search-input"
            />
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="swap-submit-btn"
          >
            {isLoading ? (
              <Loader2 className="swap-submit-spinner" />
            ) : (
              <>
                <Sparkles />
                <span>AI Find Swap</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Custom Query Results */}
      {customResults && (
        <div className="swap-ai-results">
          <h2 className="swap-ai-results-heading">
            <Sparkles /> AI Recommended Substitutes for "{searchQuery}":
          </h2>
          <div className="swap-ai-grid">
            {customResults.map((sub, idx) => (
              <div key={idx} className="swap-ai-card">
                <div className="swap-ai-card-header">
                  <span className="swap-ai-original">
                    {sub.originalIngredient}
                  </span>
                  <span className="swap-ai-substitute">➜ {sub.substitute}</span>
                </div>
                <div className="swap-ai-ratio">Ratio: {sub.ratioOrNote}</div>
                <div className="swap-ai-reason">{sub.reason}</div>
                {sub.macroDelta && (
                  <div className="swap-ai-macro">
                    Net macros: {getMacroDeltaSummary(sub.macroDelta)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Preset Library */}
      <div className="swap-presets">
        <h2 className="swap-presets-heading">
          <BookOpen /> Popular Kitchen Ingredient Swaps
        </h2>

        <div className="swap-presets-grid">
          {Object.entries(COMMON_PRESET_SUBSTITUTIONS).map(([title, subs]) => (
            <div key={title} className="swap-preset-card">
              <h3 className="swap-preset-card-heading">
                <RefreshCw /> Substitute for {title}
              </h3>

              <div className="swap-preset-list">
                {subs.map((sub, idx) => (
                  <div key={idx} className="swap-preset-item">
                    <div className="swap-preset-item-title">
                      <CheckCircle2 />
                      {sub.substitute}
                    </div>
                    <div className="swap-preset-item-ratio">
                      Ratio: {sub.ratioOrNote}
                    </div>
                    <div className="swap-preset-item-reason">{sub.reason}</div>
                    {sub.macroDelta && (
                      <div className="swap-preset-item-macro">
                        Net macros: {getMacroDeltaSummary(sub.macroDelta)}
                      </div>
                    )}
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
