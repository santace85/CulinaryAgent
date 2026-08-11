import React, { useState, useRef, useEffect } from "react";
import { AgentMessage, Recipe, Ingredient } from "../types";
import { DynamicRecipeCard } from "./DynamicRecipeCard";
import { fetchAIRecipe, fetchAISubstitutions } from "../services/api";
import { getMacroDeltaSummary } from "../utils/nutrition";
import {
  Send,
  Sparkles,
  Utensils,
  Bot,
  User,
  ChefHat,
  Filter,
  Users,
  Repeat,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface AgentChatWindowProps {
  messages: AgentMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
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
  onOpenSubstitutions: (ingredientName: string) => void;
}

const PRESET_PROMPTS = [
  "🍝 Quick 15-minute Creamy Tuscan Pasta with Garlic & Spinach",
  "🥗 Gluten-Free High-Protein Mediterranean Grilled Chicken Bowl",
  "🥩 Tender Low-Carb Butter Garlic Pan-Seared Steak with Asparagus",
  "🍰 Easy 3-Ingredient Avocado Chocolate Mousse",
  "🥑 Vegetarian Crispy Chickpea Buddha Bowl with Tahini",
];

const DIETARY_TAGS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Low-Carb",
  "High-Protein",
  "Quick 20-Min",
];

export const AgentChatWindow: React.FC<AgentChatWindowProps> = ({
  messages,
  setMessages,
  onToggleFavorite,
  isFavorite,
  onAddToShoppingList,
  onStartTimer,
  onOpenCookingMode,
  onOpenSubstitutions,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [targetServings, setTargetServings] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || inputText.trim();
    if (!promptToUse || isLoading) return;

    const userMsgId = "msg_user_" + Date.now();
    const newUserMsg: AgentMessage = {
      id: userMsgId,
      sender: "user",
      text: promptToUse,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const agentThinkingId = "msg_agent_thinking_" + Date.now();
    const newThinkingMsg: AgentMessage = {
      id: agentThinkingId,
      sender: "agent",
      text: "Crafting a custom culinary recipe with step-by-step instructions and ingredient lists...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };

    setMessages((prev) => [...prev, newUserMsg, newThinkingMsg]);
    if (!customPrompt) setInputText("");
    setIsLoading(true);

    try {
      // Check if user is asking for ingredient substitutions
      if (
        promptToUse.toLowerCase().includes("substitute") ||
        promptToUse.toLowerCase().includes("swap") ||
        promptToUse.toLowerCase().includes("instead of")
      ) {
        const subs = await fetchAISubstitutions(promptToUse);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentThinkingId
              ? {
                  id: "msg_agent_" + Date.now(),
                  sender: "agent",
                  text: `Here are the top chef-approved ingredient substitutions for "${promptToUse}":`,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  substitutionsList: subs,
                  isThinking: false,
                }
              : msg,
          ),
        );
      } else {
        // Fetch AI Recipe
        const { recipe, isFallback, error, recommendedRecipes } =
          await fetchAIRecipe({
            prompt: promptToUse,
            dietary: selectedDietary,
            servings: targetServings,
          });

        const agentText = isFallback
          ? `I ran into an issue generating your custom recipe: ${error || "Unable to reach the AI service."} Here’s a tasty curated recipe and some popular alternatives you can load instantly.`
          : `Here is your custom AI Agent created recipe for **${recipe.title}**, complete with interactive ingredient checkboxes, step-by-step timers, and substitutions:`;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentThinkingId
              ? {
                  id: "msg_agent_" + Date.now(),
                  sender: "agent",
                  text: agentText,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  recipe,
                  recommendedRecipes: isFallback
                    ? recommendedRecipes
                    : undefined,
                  isThinking: false,
                }
              : msg,
          ),
        );
      }
    } catch (err: any) {
      console.error("Agent error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentThinkingId
            ? {
                id: "msg_agent_" + Date.now(),
                sender: "agent",
                text: "I encountered an issue generating your recipe. Don't worry, here is a delicious curated dish for you!",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isThinking: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear conversation history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Agent Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-3 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                Culinary AI Recipe Agent
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Ask for recipes by ingredient, meal, or dietary craving
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Servings count */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Servings:</span>
              <select
                value={targetServings}
                onChange={(e) => setTargetServings(Number(e.target.value))}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                {[1, 2, 4, 6, 8, 12].map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="bg-slate-900 text-white"
                  >
                    {num} people
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dietary Tag Selectors */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <div className="flex items-center space-x-1 text-slate-400 shrink-0 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>
          {DIETARY_TAGS.map((tag) => {
            const isSelected = selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {tag} {isSelected && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              What are we cooking today?
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Ask your AI Agent for recipes based on what's in your fridge,
              specific diets, or cooking techniques.
            </p>

            <div className="w-full max-w-xl space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Try asking one of these:
              </div>
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/40 text-xs sm:text-sm text-slate-300 hover:text-orange-300 transition-all flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <Sparkles className="w-4 h-4 text-slate-600 group-hover:text-orange-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.sender === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
                    <div className="flex items-center justify-between text-[10px] text-orange-200/80 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <User className="w-3 h-3" /> You
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-orange-400" />
                  </div>

                  <div className="flex-1 max-w-4xl space-y-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed shadow-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                        <span className="font-semibold text-orange-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> CulinaryAgent AI
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {msg.isThinking ? (
                        <div className="flex items-center space-x-3 py-3 text-orange-300">
                          <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                          <span className="text-xs font-medium animate-pulse">
                            {msg.text}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-3 font-medium">{msg.text}</p>

                          {msg.recommendedRecipes &&
                            msg.recommendedRecipes.length > 0 && (
                              <div className="space-y-3 mb-4">
                                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                  Popular fallback recipes:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {msg.recommendedRecipes.map((recipe) => (
                                    <button
                                      key={recipe.id}
                                      type="button"
                                      onClick={() => {
                                        const recipeMessage: AgentMessage = {
                                          id:
                                            "msg_agent_recipe_" +
                                            Date.now() +
                                            Math.random().toString(36).slice(2),
                                          sender: "agent",
                                          text: `Loading **${recipe.title}** into the chat for you.`,
                                          timestamp:
                                            new Date().toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }),
                                          recipe,
                                        };
                                        setMessages((prev) => [
                                          ...prev,
                                          recipeMessage,
                                        ]);
                                      }}
                                      className="w-full rounded-2xl border border-orange-500/25 bg-slate-950/90 px-4 py-3 text-left text-sm text-slate-100 hover:border-orange-400/40 hover:bg-slate-900 transition-all"
                                    >
                                      <div className="font-semibold text-amber-200 underline decoration-orange-500/40 decoration-2 underline-offset-4">
                                        {recipe.title}
                                      </div>
                                      <div className="text-[11px] text-slate-400 mt-1">
                                        {recipe.summary}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Substitutions List if requested */}
                          {msg.substitutionsList && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                              {msg.substitutionsList.map((s, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                                >
                                  <div className="font-bold text-amber-300">
                                    {s.substitute}
                                  </div>
                                  <div className="text-slate-400">
                                    Ratio: {s.ratioOrNote}
                                  </div>
                                  <div className="text-slate-300 italic">
                                    {s.reason}
                                  </div>
                                  {s.macroDelta && (
                                    <div className="text-[10px] text-emerald-300/90">
                                      Net macros:{" "}
                                      {getMacroDeltaSummary(s.macroDelta)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dynamic Recipe Card standard component */}
                    {msg.recipe && (
                      <DynamicRecipeCard
                        recipe={msg.recipe}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={isFavorite(msg.recipe.id)}
                        onAddToShoppingList={onAddToShoppingList}
                        onStartTimer={onStartTimer}
                        onOpenCookingMode={onOpenCookingMode}
                        onRequestSubstitution={(ing) =>
                          onOpenSubstitutions(ing)
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Agent: 'Recipe for dinner with chicken, garlic, spinach...' or 'Egg substitute'"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm flex items-center space-x-1.5 hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-orange-600/30"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
