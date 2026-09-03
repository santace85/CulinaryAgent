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
import "./AgentChatWindow.css";

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
  const [history, setHistory] = useState<
    { userPrompt: string; recipeTitle?: string }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToNewRecipe = (id: string) => {
    // Wait for DOM update
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element && chatAreaRef.current) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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
        // Fetch AI Recipe with History
        const { recipe, isFallback, error, recommendedRecipes } =
          await fetchAIRecipe({
            prompt: promptToUse,
            dietary: selectedDietary,
            servings: targetServings,
            history: history.slice(-5), // Keep last 3 interactions for context
          });

        const agentText = isFallback
          ? error || "Unable to reach the AI service right now."
          : recipe?.agentIntro ||
            `Here is your custom AI Agent created recipe for **${recipe?.title}**.`;

        const agentMsgId = "msg_agent_" + Date.now();

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentThinkingId
              ? {
                  id: agentMsgId,
                  sender: "agent",
                  text: agentText,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  recipe: isFallback ? undefined : recipe,
                  recommendedRecipes: isFallback
                    ? recommendedRecipes
                    : undefined,
                  isThinking: false,
                }
              : msg,
          ),
        );

        if (!isFallback && recipe) {
          setHistory((prev) => [
            ...prev,
            { userPrompt: promptToUse, recipeTitle: recipe.title },
          ]);
          scrollToNewRecipe(agentMsgId);
        }
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
      setHistory([]);
    }
  };

  const handleSelectFallbackRecipe = (recipe: Recipe) => {
    const loadingMessageId = "msg_agent_loading_" + Date.now();
    const loadingMsg: AgentMessage = {
      id: loadingMessageId,
      sender: "agent",
      text: `Loading **${recipe.title}** into the chat for you...`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isThinking: true,
    };

    setMessages((prev) => [...prev, loadingMsg]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                id: "msg_agent_recipe_" + Date.now(),
                sender: "agent",
                text: `Here is your fallback recipe for **${recipe.title}**.`,
                isThinking: false,
                recipe,
              }
            : msg,
        ),
      );
    }, 3000);
  };

  return (
    <div className="chat-container">
      {/* Top Agent Controls Bar */}
      <div className="chat-controls">
        <div className="chat-controls-row">
          <div className="chat-brand">
            <div className="chat-icon-box">
              <Bot />
            </div>
            <div>
              <h1 className="chat-title">
                Culinary AI Recipe Agent
                <span className="chat-title-dot"></span>
              </h1>
              <p className="chat-subtitle">
                Ask for recipes by ingredient, meal, or dietary craving
              </p>
            </div>
          </div>

          <div className="chat-controls-right">
            {/* Servings count */}
            <div className="chat-servings">
              <Users className="chat-servings-icon" />
              <span className="chat-servings-label">Servings:</span>
              <select
                value={targetServings}
                onChange={(e) => setTargetServings(Number(e.target.value))}
                className="chat-servings-select"
              >
                {[1, 2, 4, 6, 8, 12].map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="chat-servings-option"
                  >
                    {num} people
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearChat}
              className="chat-clear-btn"
              title="Clear Conversation"
            >
              <Trash2 />
            </button>
          </div>
        </div>

        {/* Dietary Tag Selectors */}
        <div className="chat-tags-row chat-scrollbar">
          <div className="chat-tags-label">
            <Filter />
            <span>Filters:</span>
          </div>
          {DIETARY_TAGS.map((tag) => {
            const isSelected = selectedDietary.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`chat-tag ${
                  isSelected ? "chat-tag--selected" : "chat-tag--unselected"
                }`}
              >
                {tag} {isSelected && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatAreaRef} className="chat-messages chat-scrollbar">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon-box">
              <ChefHat />
            </div>
            <h2 className="chat-empty-title">What are we cooking today?</h2>
            <p className="chat-empty-desc">
              Ask your AI Agent for recipes based on what's in your fridge,
              specific diets, or cooking techniques.
            </p>

            <div className="chat-prompts">
              <div className="chat-prompts-label">Try asking one of these:</div>
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="chat-prompt-btn"
                >
                  <span>{prompt}</span>
                  <Sparkles className="chat-prompt-icon" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} id={msg.id} className="chat-message">
              {msg.sender === "user" ? (
                <div className="chat-user-row">
                  <div className="chat-user-bubble">
                    <div className="chat-user-bubble-header">
                      <span className="chat-user-label">
                        <User /> You
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="chat-user-text">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="chat-agent-row">
                  <div className="chat-agent-avatar">
                    <Bot />
                  </div>

                  <div className="chat-agent-content">
                    <div className="chat-agent-bubble">
                      <div className="chat-agent-bubble-header">
                        <span className="chat-agent-label">
                          <Sparkles /> CulinaryAgent AI
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {msg.isThinking ? (
                        <div className="chat-thinking-row">
                          <Loader2 className="chat-thinking-spinner" />
                          <span className="chat-thinking-text">{msg.text}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="chat-agent-text">{msg.text}</p>

                          {msg.recommendedRecipes &&
                            msg.recommendedRecipes.length > 0 && (
                              <div className="chat-fallback-list">
                                <div className="chat-fallback-label">
                                  Popular fallback recipes:
                                </div>
                                <div className="chat-fallback-grid">
                                  {msg.recommendedRecipes.map((recipe) => (
                                    <button
                                      key={recipe.id}
                                      type="button"
                                      onClick={() =>
                                        handleSelectFallbackRecipe(recipe)
                                      }
                                      className="chat-fallback-card"
                                    >
                                      <div className="chat-fallback-title">
                                        {recipe.title}
                                      </div>
                                      <div className="chat-fallback-summary">
                                        {recipe.summary}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Substitutions List if requested */}
                          {msg.substitutionsList && (
                            <div className="chat-subs-grid">
                              {msg.substitutionsList.map((s, idx) => (
                                <div key={idx} className="chat-sub-card">
                                  <div className="chat-sub-name">
                                    {s.substitute}
                                  </div>
                                  <div className="chat-sub-ratio">
                                    Ratio: {s.ratioOrNote}
                                  </div>
                                  <div className="chat-sub-reason">
                                    {s.reason}
                                  </div>
                                  {s.macroDelta && (
                                    <div className="chat-sub-macro">
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
                        initialServings={targetServings}
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
      <div className="chat-input-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chat-input-form"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Agent: 'Recipe for dinner with chicken, garlic, spinach...' or 'Egg substitute'"
            className="chat-input"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="chat-send-btn"
          >
            {isLoading ? (
              <Loader2 className="chat-send-spinner" />
            ) : (
              <>
                <Send />
                <span className="chat-send-label">Ask AI</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
